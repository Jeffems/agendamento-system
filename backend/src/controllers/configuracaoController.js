import { z } from "zod";
import prisma from "../lib/prisma.js";

const diaSchema = z.object({
  ativo: z.boolean(),
  inicio: z.string().regex(/^\d{2}:\d{2}$/),
  fim: z.string().regex(/^\d{2}:\d{2}$/),
});

const configuracaoSchema = z.object({
  nome_negocio: z.string().trim().max(120).nullable().optional(),
  telefone_negocio: z.string().trim().max(30).nullable().optional(),
  endereco_negocio: z.string().trim().max(250).nullable().optional(),
  logo_url: z.union([z.string().trim().url(), z.literal(""), z.null()]).optional().transform((v) => v || null),
  timezone: z.string().trim().min(3).max(80).optional(),
  horarios_funcionamento: z.record(z.string(), diaSchema).nullable().optional(),
  lembrete_email_ativo: z.boolean().optional(),
  lembrete_whatsapp_ativo: z.boolean().optional(),
  onboarding_concluido: z.boolean().optional(),
});

const campos = {
  id: true, nome: true, email: true, nome_negocio: true,
  telefone_negocio: true, endereco_negocio: true, logo_url: true,
  timezone: true, horarios_funcionamento: true,
  lembrete_email_ativo: true, lembrete_whatsapp_ativo: true,
  onboarding_concluido: true,
};

export async function obterConfiguracoes(req, res) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: campos });
  if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
  return res.json(usuario);
}

export async function atualizarConfiguracoes(req, res) {
  const parsed = configuracaoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
  const data = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v]));
  const usuario = await prisma.usuario.update({ where: { id: req.user.id }, data, select: campos });
  return res.json(usuario);
}
