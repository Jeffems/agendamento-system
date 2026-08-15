import { addDays, addHours, addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import prisma from "../lib/prisma.js";

const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const dataSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const criarSchema = z.object({
  servicoId: z.string().uuid(),
  data_agendamento: z.string().datetime(),
  nome: z.string().trim().min(2).max(120),
  sobrenome: z.string().trim().max(120).optional().default(""),
  email: z.union([z.string().trim().email(), z.literal(""), z.null()]).optional().transform((v) => v || null),
  contato: z.string().trim().min(8).max(30),
  observacoes: z.string().trim().max(500).optional().transform((v) => v || null),
});

async function obterAgenda(slug) {
  return prisma.usuario.findFirst({
    where: { slug, agenda_publica_ativa: true, OR: [{ plano: "profissional", assinatura_status: "active" }, { plano: "teste", assinatura_status: "trialing", trial_ends_at: { gt: new Date() } }] },
    select: {
      id: true, nome: true, nome_negocio: true, telefone_negocio: true,
      endereco_negocio: true, logo_url: true, timezone: true,
      horarios_funcionamento: true, intervalo_agendamento_min: true,
      antecedencia_min_horas: true, limite_agendamento_dias: true,
      servicos: { where: { ativo: true }, orderBy: { nome: "asc" }, select: { id: true, nome: true, descricao: true, preco: true, duracao_min: true, cor: true } },
    },
  });
}

function janelaDoDia(agenda, data) {
  const indice = new Date(`${data}T12:00:00Z`).getUTCDay();
  const horario = agenda.horarios_funcionamento?.[dias[indice]];
  if (!horario?.ativo) return null;
  const timezone = agenda.timezone || "America/Cuiaba";
  const inicio = fromZonedTime(`${data}T${horario.inicio}:00`, timezone);
  const fim = fromZonedTime(`${data}T${horario.fim}:00`, timezone);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio) return null;
  return { inicio, fim };
}

export async function obterAgendaPublica(req, res) {
  const agenda = await obterAgenda(req.params.slug);
  if (!agenda) return res.status(404).json({ error: "Agenda não encontrada ou indisponível" });
  return res.json({ ...agenda, id: undefined });
}

export async function listarHorariosPublicos(req, res) {
  const parsed = dataSchema.safeParse(req.query.data);
  const servicoId = String(req.query.servicoId || "");
  if (!parsed.success || !z.string().uuid().safeParse(servicoId).success) return res.status(400).json({ error: "Data ou serviço inválido" });
  const agenda = await obterAgenda(req.params.slug);
  if (!agenda) return res.status(404).json({ error: "Agenda não encontrada ou indisponível" });
  const servico = agenda.servicos.find((s) => s.id === servicoId);
  if (!servico) return res.status(404).json({ error: "Serviço indisponível" });
  const janela = janelaDoDia(agenda, parsed.data);
  if (!janela) return res.json({ horarios: [] });
  const agora = new Date();
  if (janela.inicio > addDays(agora, agenda.limite_agendamento_dias)) return res.json({ horarios: [] });
  const ocupados = await prisma.agendamento.findMany({ where: { usuarioId: agenda.id, status: { not: "cancelado" }, data_agendamento: { gte: addHours(janela.inicio, -12), lt: addHours(janela.fim, 12) } }, select: { data_agendamento: true, duracao_min: true } });
  const minimo = addHours(agora, agenda.antecedencia_min_horas);
  const intervalo = agenda.intervalo_agendamento_min || 0;
  const horarios = [];
  for (let cursor = janela.inicio; addMinutes(cursor, servico.duracao_min) <= janela.fim; cursor = addMinutes(cursor, 15)) {
    if (cursor < minimo) continue;
    const fim = addMinutes(cursor, servico.duracao_min);
    const conflita = ocupados.some((a) => new Date(a.data_agendamento) < addMinutes(fim, intervalo) && addMinutes(new Date(a.data_agendamento), (a.duracao_min || 60) + intervalo) > cursor);
    if (!conflita) horarios.push(cursor.toISOString());
  }
  return res.json({ horarios });
}

export async function criarAgendamentoPublico(req, res) {
  const parsed = criarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
  const agenda = await obterAgenda(req.params.slug);
  if (!agenda) return res.status(404).json({ error: "Agenda não encontrada ou indisponível" });
  const servico = agenda.servicos.find((s) => s.id === parsed.data.servicoId);
  if (!servico) return res.status(404).json({ error: "Serviço indisponível" });
  const inicio = new Date(parsed.data.data_agendamento);
  const localDate = formatInTimeZone(inicio, agenda.timezone || "America/Cuiaba", "yyyy-MM-dd");
  const janela = janelaDoDia(agenda, localDate);
  const fim = addMinutes(inicio, servico.duracao_min);
  if (!janela || inicio < janela.inicio || fim > janela.fim || ((inicio.getTime() - janela.inicio.getTime()) / 60000) % 15 !== 0) return res.status(400).json({ error: "Horário fora do funcionamento" });
  const agora = new Date();
  if (inicio < addHours(agora, agenda.antecedencia_min_horas) || inicio > addDays(agora, agenda.limite_agendamento_dias)) return res.status(400).json({ error: "Horário fora do período permitido" });
  try {
    const criado = await prisma.$transaction(async (tx) => {
      const intervalo = agenda.intervalo_agendamento_min || 0;
      const candidatos = await tx.agendamento.findMany({ where: { usuarioId: agenda.id, status: { not: "cancelado" }, data_agendamento: { gte: addHours(inicio, -12), lt: addHours(fim, 12) } }, select: { data_agendamento: true, duracao_min: true } });
      if (candidatos.some((a) => new Date(a.data_agendamento) < addMinutes(fim, intervalo) && addMinutes(new Date(a.data_agendamento), (a.duracao_min || 60) + intervalo) > inicio)) throw new Error("HORARIO_OCUPADO");
      const contato = parsed.data.contato.trim();
      let cliente = await tx.cliente.findFirst({ where: { usuarioId: agenda.id, OR: [{ contato }, ...(parsed.data.email ? [{ email: parsed.data.email }] : [])] } });
      if (!cliente) cliente = await tx.cliente.create({ data: { usuarioId: agenda.id, nome: parsed.data.nome, sobrenome: parsed.data.sobrenome, email: parsed.data.email, contato } });
      return tx.agendamento.create({ data: { usuarioId: agenda.id, clienteId: cliente.id, servicoId: servico.id, nome: parsed.data.nome, sobrenome: parsed.data.sobrenome, email: parsed.data.email, contato, servico: servico.nome, duracao_min: servico.duracao_min, data_agendamento: inicio, observacoes: parsed.data.observacoes } });
    }, { isolationLevel: "Serializable" });
    return res.status(201).json({ id: criado.id, nome: criado.nome, servico: criado.servico, data_agendamento: criado.data_agendamento });
  } catch (error) {
    if (error.message === "HORARIO_OCUPADO" || error.code === "P2034") return res.status(409).json({ error: "Este horário acabou de ser ocupado. Escolha outro." });
    throw error;
  }
}
