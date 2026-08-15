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
  slug: z.union([z.string().trim().min(3).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), z.literal(""), z.null()]).optional().transform((v) => v || null),
  agenda_publica_ativa: z.boolean().optional(),
  intervalo_agendamento_min: z.coerce.number().int().min(0).max(180).optional(),
  antecedencia_min_horas: z.coerce.number().int().min(0).max(720).optional(),
  limite_agendamento_dias: z.coerce.number().int().min(1).max(365).optional(),
});

const campos = {
  id: true, nome: true, email: true, nome_negocio: true,
  telefone_negocio: true, endereco_negocio: true, logo_url: true,
  timezone: true, horarios_funcionamento: true,
  lembrete_email_ativo: true, lembrete_whatsapp_ativo: true,
  onboarding_concluido: true,
  slug: true, agenda_publica_ativa: true, intervalo_agendamento_min: true,
  antecedencia_min_horas: true, limite_agendamento_dias: true,
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
  if (data.slug) {
    const emUso = await prisma.usuario.findFirst({ where: { slug: data.slug, id: { not: req.user.id } }, select: { id: true } });
    if (emUso) return res.status(409).json({ error: "Este endereço público já está em uso" });
  }
  const usuario = await prisma.usuario.update({ where: { id: req.user.id }, data, select: campos });
  return res.json(usuario);
}
