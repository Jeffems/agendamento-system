import { z } from "zod";
import prisma from "../lib/prisma.js";
import { decrypt } from "../utils/crypto.js";
import { markMessageRead, sendText } from "../services/whatsappService.js";
import { registrarMensagemSaida } from "../services/whatsappInboxService.js";

export async function listarConversas(req, res) {
  const busca = String(req.query.busca || "").trim();
  const conversas = await prisma.whatsAppConversation.findMany({
    where: { usuarioId: req.user.id, ...(busca ? { OR: [{ nome: { contains: busca, mode: "insensitive" } }, { contato: { contains: busca } }] } : {}) },
    orderBy: { ultima_mensagem_em: "desc" }, take: 100,
  });
  return res.json(conversas);
}

export async function listarMensagens(req, res) {
  const conversa = await prisma.whatsAppConversation.findFirst({ where: { id: req.params.id, usuarioId: req.user.id }, select: { id: true } });
  if (!conversa) return res.status(404).json({ error: "Conversa não encontrada" });
  const cursor = req.query.cursor ? String(req.query.cursor) : null;
  const mensagens = await prisma.whatsAppMessage.findMany({ where: { conversationId: conversa.id, usuarioId: req.user.id }, orderBy: [{ mensagem_em: "desc" }, { id: "desc" }], take: 51, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
  const temMais = mensagens.length > 50;
  const pagina = mensagens.slice(0, 50);
  const nextCursor = temMais ? pagina[pagina.length - 1]?.id : null;
  return res.json({ mensagens: pagina.reverse(), nextCursor });
}

export async function responderConversa(req, res) {
  const parsed = z.object({ texto: z.string().trim().min(1).max(4000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Mensagem inválida" });
  const conversa = await prisma.whatsAppConversation.findFirst({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!conversa) return res.status(404).json({ error: "Conversa não encontrada" });
  if (!conversa.janela_atendimento_ate || conversa.janela_atendimento_ate <= new Date()) return res.status(409).json({ error: "A janela de atendimento expirou. Envie um template aprovado para reabrir a conversa.", code: "CUSTOMER_WINDOW_CLOSED" });
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: { wa_status: true, wa_phone_number_id: true, wa_access_token: true } });
  if (usuario?.wa_status !== "connected" || !usuario.wa_phone_number_id || !usuario.wa_access_token) return res.status(400).json({ error: "WhatsApp não conectado" });
  const resposta = await sendText({ phoneNumberId: usuario.wa_phone_number_id, accessToken: decrypt(usuario.wa_access_token), to: conversa.contato, text: parsed.data.texto });
  const waMessageId = resposta?.messages?.[0]?.id;
  if (!waMessageId) return res.status(502).json({ error: "A Meta não confirmou o envio" });
  await registrarMensagemSaida({ usuarioId: req.user.id, contato: conversa.contato, nome: conversa.nome, waMessageId, conteudo: parsed.data.texto });
  const mensagem = await prisma.whatsAppMessage.findUnique({ where: { wa_message_id: waMessageId } });
  return res.status(201).json(mensagem);
}

export async function marcarConversaLida(req, res) {
  const conversa = await prisma.whatsAppConversation.findFirst({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!conversa) return res.status(404).json({ error: "Conversa não encontrada" });
  await prisma.whatsAppConversation.update({ where: { id: conversa.id }, data: { nao_lidas: 0 } });
  const ultima = await prisma.whatsAppMessage.findFirst({ where: { conversationId: conversa.id, direcao: "inbound" }, orderBy: { mensagem_em: "desc" }, select: { wa_message_id: true } });
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: { wa_phone_number_id: true, wa_access_token: true } });
  if (ultima && usuario?.wa_phone_number_id && usuario?.wa_access_token) markMessageRead({ phoneNumberId: usuario.wa_phone_number_id, accessToken: decrypt(usuario.wa_access_token), messageId: ultima.wa_message_id }).catch(() => {});
  return res.json({ ok: true });
}
