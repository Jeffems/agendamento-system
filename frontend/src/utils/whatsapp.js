import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function buildWhatsAppReminderLink({ agendamento }) {
  let telefone = String(agendamento.contato || "").replace(/\D/g, "");

  telefone = telefone.replace(/^0+/, "");

  if (!telefone) {
    throw new Error("Agendamento sem telefone cadastrado");
  }

  if (!telefone.startsWith("55")) {
    telefone = `55${telefone}`;
  }

  if (telefone.length < 12 || telefone.length > 13) {
    throw new Error("Telefone inválido para WhatsApp");
  }

  const dateObj = new Date(agendamento.data_agendamento);

  const data = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  const hora = format(dateObj, "HH:mm", { locale: ptBR });

  const msg =
    `Olá ${agendamento.nome}! \n` +
    `Passando para lembrar do seu agendamento.\n\n` +
    `Data: *${data}*\n` +
    `Horário: *${hora}*\n` +
    `Serviço: *${agendamento.servico}*\n` +
    (agendamento.observacoes ? ` Obs.: ${agendamento.observacoes}\n` : "") +
    `\nSe precisar reagendar, me avise por aqui. `;

  return `https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`;
}

export function openWhatsApp(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}
