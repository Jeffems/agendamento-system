import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function buildWhatsAppReminderLink({ agendamento }) {
  const dateObj = new Date(agendamento.data_agendamento);

  const data = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  const hora = format(dateObj, "HH:mm", { locale: ptBR });

  const msg =
    `Olá ${agendamento.nome}! 👋\n` +
    `Passando para lembrar do seu agendamento.\n\n` +
    `🗓️ Data: *${data}*\n` +
    `⏰ Horário: *${hora}*\n` +
    `💼 Serviço: *${agendamento.servico}*\n` +
    (agendamento.observacoes ? `📝 Obs.: ${agendamento.observacoes}\n` : "") +
    `\nSe precisar reagendar, me avise por aqui. 🙂`;

  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
