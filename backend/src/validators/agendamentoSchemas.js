import { z } from "zod";

export const statusAgendamentoValues = [
  "pendente",
  "confirmado",
  "concluido",
  "cancelado",
];

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

const sobrenomeSchema = z
  .string()
  .trim()
  .max(120, "Sobrenome muito longo");

const emailSchema = z
  .union([z.string().trim().email("Email inválido"), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value ? value.trim() : null));

const dataAgendamentoSchema = z
  .string()
  .datetime("data_agendamento inválida");

const duracaoSchema = z.coerce
  .number()
  .int("Duração inválida")
  .min(15, "Duração mínima é 15 minutos")
  .max(480, "Duração máxima é 480 minutos");

const observacoesSchema = z
  .string()
  .trim()
  .max(1000, "Observações muito longas")
  .optional()
  .transform((value) => value || null);

const clienteIdSchema = z
  .union([z.string().uuid("Cliente inválido"), z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);

const camposAgendamento = {
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: sobrenomeSchema,
  email: emailSchema,
  contato: optionalTrimmedString,
  servico: z.string().trim().min(2, "Serviço deve ter pelo menos 2 caracteres"),
  data_agendamento: dataAgendamentoSchema,
  duracao_min: duracaoSchema,
  status: z.enum(statusAgendamentoValues),
  observacoes: observacoesSchema,
  clienteId: clienteIdSchema,
};

export const agendamentoSchema = z.object({
  ...camposAgendamento,
  sobrenome: sobrenomeSchema.optional().default(""),
  duracao_min: duracaoSchema.default(60),
  status: z.enum(statusAgendamentoValues).default("pendente"),
});

export const atualizarAgendamentoSchema = z
  .object(camposAgendamento)
  .partial();
