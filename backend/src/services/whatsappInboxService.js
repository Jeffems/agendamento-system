import { addHours } from "date-fns";
import prisma from "../lib/prisma.js";

function resumoMensagem(mensagem) {
  if (mensagem.type === "text") return mensagem.text?.body || "";
  if (mensagem.type === "button") return mensagem.button?.text || "[Botão]";
  if (mensagem.type === "interactive") return mensagem.interactive?.button_reply?.title || mensagem.interactive?.list_reply?.title || "[Interação]";
  if (mensagem.type === "image") return mensagem.image?.caption || "[Imagem]";
  if (mensagem.type === "video") return mensagem.video?.caption || "[Vídeo]";
  if (mensagem.type === "audio") return "[Áudio]";
  if (mensagem.type === "document") return mensagem.document?.caption || mensagem.document?.filename || "[Documento]";
  if (mensagem.type === "sticker") return "[Figurinha]";
  if (mensagem.type === "location") return "[Localização]";
  if (mensagem.type === "contacts") return "[Contato]";
  return `[${mensagem.type || "Mensagem"}]`;
}

export async function registrarMensagemEntrada({ usuarioId, mensagem, nome }) {
  if (!mensagem?.id || !mensagem?.from) return;
  if (await prisma.whatsAppMessage.findUnique({ where: { wa_message_id: mensagem.id }, select: { id: true } })) return;
  const data = mensagem.timestamp ? new Date(Number(mensagem.timestamp) * 1000) : new Date();
  const conteudo = resumoMensagem(mensagem).slice(0, 4000);
  await prisma.$transaction(async (tx) => {
    const conversa = await tx.whatsAppConversation.upsert({
      where: { usuarioId_contato: { usuarioId, contato: mensagem.from } },
      create: { usuarioId, contato: mensagem.from, nome: nome || null, ultima_mensagem: conteudo.slice(0, 250), ultima_mensagem_em: data, nao_lidas: 1, janela_atendimento_ate: addHours(data, 24) },
      update: { ...(nome ? { nome } : {}), ultima_mensagem: conteudo.slice(0, 250), ultima_mensagem_em: data, nao_lidas: { increment: 1 }, janela_atendimento_ate: addHours(data, 24) },
    });
    await tx.whatsAppMessage.create({ data: { usuarioId, conversationId: conversa.id, wa_message_id: mensagem.id, direcao: "inbound", tipo: mensagem.type || "unknown", conteudo, status: "received", mensagem_em: data } });
  });
}

export async function registrarMensagemSaida({ usuarioId, contato, nome, waMessageId, conteudo, tipo = "text", agendamentoId = null }) {
  if (!usuarioId || !contato || !waMessageId) return;
  if (await prisma.whatsAppMessage.findUnique({ where: { wa_message_id: waMessageId }, select: { id: true } })) return;
  const agora = new Date();
  await prisma.$transaction(async (tx) => {
    const conversa = await tx.whatsAppConversation.upsert({
      where: { usuarioId_contato: { usuarioId, contato } },
      create: { usuarioId, contato, nome: nome || null, ultima_mensagem: String(conteudo || "").slice(0, 250), ultima_mensagem_em: agora },
      update: { ...(nome ? { nome } : {}), ultima_mensagem: String(conteudo || "").slice(0, 250), ultima_mensagem_em: agora },
    });
    await tx.whatsAppMessage.create({ data: { usuarioId, conversationId: conversa.id, agendamentoId, wa_message_id: waMessageId, direcao: "outbound", tipo, conteudo: String(conteudo || "").slice(0, 4000), status: "accepted", mensagem_em: agora } });
  });
}

const ordemStatus = { accepted: 0, sent: 1, delivered: 2, read: 3, failed: 4 };
export async function atualizarStatusMensagem(status) {
  if (!status?.id || !status?.status) return;
  const mensagem = await prisma.whatsAppMessage.findUnique({ where: { wa_message_id: status.id }, select: { id: true, status: true } });
  if (!mensagem || (ordemStatus[status.status] ?? 0) < (ordemStatus[mensagem.status] ?? 0)) return;
  const quando = status.timestamp ? new Date(Number(status.timestamp) * 1000) : new Date();
  const erro = status.errors?.[0];
  await prisma.whatsAppMessage.update({ where: { id: mensagem.id }, data: { status: status.status, ...(status.status === "delivered" ? { entregue_em: quando } : {}), ...(status.status === "read" ? { lida_em: quando, entregue_em: quando } : {}), ...(erro ? { erro_codigo: String(erro.code || ""), erro_mensagem: String(erro.title || erro.message || "Falha no envio").slice(0, 500) } : {}) } });
}
