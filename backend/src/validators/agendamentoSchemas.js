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

export const agendamentoSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: z.string().trim().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z
    .union([z.string().trim().email("Email inválido"), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value ? value.trim() : null)),
  contato: optionalTrimmedString,
  servico: z.string().trim().min(2, "Serviço deve ter pelo menos 2 caracteres"),
  data_agendamento: z.string().datetime("data_agendamento inválida"),
  duracao_min: z.coerce
    .number()
    .int("Duração inválida")
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 480 minutos")
    .default(60),
  status: z.enum(statusAgendamentoValues).default("pendente"),
  observacoes: z
    .string()
    .trim()
    .max(1000, "Observações muito longas")
    .optional()
    .transform((value) => value || null),
  lembrete_enviado: z.boolean().optional(),
});