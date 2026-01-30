import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export function buildWhatsAppReminderLink({ agendamento, timezone = "America/Cuiaba" }) {
  const dateObj = new Date(agendamento.data_agendamento);

  const data = formatInTimeZone(dateObj, timezone, "dd/MM/yyyy", { locale: ptBR });
  const hora = formatInTimeZone(dateObj, timezone, "HH:mm", { locale: ptBR });

  const msg =
    `Olá ${agendamento.nome}! 👋\n` +
    `Passando para lembrar do seu agendamento.\n\n` +
    `🗓️ Data: *${data}*\n` +
    `⏰ Horário: *${hora}*\n` +
    `💼 Serviço: *${agendamento.servico}*\n` +
    (agendamento.observacoes ? `📝 Obs.: ${agendamento.observacoes}\n` : "") +
    `\nSe precisar reagendar, me avise por aqui. 🙂`;

  const text = encodeURIComponent(msg);

  // Sem telefone (melhor quando você não tem o número cadastrado):
  return `https://wa.me/?text=${text}`;

  // Se no futuro você tiver telefone E.164 no cadastro:
  // return `https://wa.me/${agendamento.telefoneE164}?text=${text}`;
}

export function openWhatsApp(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}
