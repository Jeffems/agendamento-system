import { z } from "zod";
import prisma from "../lib/prisma.js";

const schema = z.object({
  nome: z.string().trim().min(2).max(120),
  descricao: z.string().trim().max(500).nullable().optional().transform((v) => v || null),
  preco: z.union([z.coerce.number().min(0).max(99999999), z.literal(""), z.null()]).optional().transform((v) => v === "" ? null : v),
  duracao_min: z.coerce.number().int().min(15).max(480),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#4f46e5"),
  ativo: z.boolean().default(true),
});

export async function listarServicos(req, res) {
  const servicos = await prisma.servico.findMany({ where: { usuarioId: req.user.id }, orderBy: [{ ativo: "desc" }, { nome: "asc" }] });
  return res.json(servicos);
}

export async function criarServico(req, res) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
  const servico = await prisma.servico.create({ data: { ...parsed.data, usuarioId: req.user.id } });
  return res.status(201).json(servico);
}

export async function atualizarServico(req, res) {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
  const existente = await prisma.servico.findFirst({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!existente) return res.status(404).json({ error: "Serviço não encontrado" });
  return res.json(await prisma.servico.update({ where: { id: existente.id }, data: parsed.data }));
}

export async function deletarServico(req, res) {
  const existente = await prisma.servico.findFirst({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!existente) return res.status(404).json({ error: "Serviço não encontrado" });
  await prisma.servico.delete({ where: { id: existente.id } });
  return res.status(204).send();
}
