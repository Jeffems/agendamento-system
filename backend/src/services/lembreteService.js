import cron from "node-cron";
import { Resend } from "resend";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import prisma from "../lib/prisma.js";
import { sendTemplate } from "./whatsappService.js";
import { decrypt } from "../utils/crypto.js";


const resend = new Resend(process.env.RESEND_API_KEY);

const TZ = process.env.APP_TIMEZONE || "America/Cuiaba";


function getFromEmail() {
  return process.env.EMAIL_FROM || "onboarding@resend.dev";
}

function normalizarTelefoneBR(numero) {
  if (!numero) return null;

  let digits = String(numero).replace(/\D/g, "");

  if (!digits) return null;

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }

  // BR normalmente fica com 12 ou 13 dígitos já com DDI
  if (digits.length < 12 || digits.length > 13) {
    return null;
  }

  return digits;
}

async function enviarEmailLembrete(agendamento) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  if (!agendamento.email) {
    return;
  }

  const dataAgendamento = new Date(agendamento.data_agendamento);

  const hora = formatInTimeZone(dataAgendamento, TZ, "HH:mm", {
    locale: ptBR,
  });
  const dataFmt = formatInTimeZone(dataAgendamento, TZ, "dd/MM/yyyy", {
    locale: ptBR,
  });

  const htmlEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h2 { color: #0f172a; }
        .info-box { background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔔 Lembrete de Agendamento</h2>
        <p>Olá <strong>${agendamento.nome} ${
    agendamento.sobrenome
  }</strong>,</p>
        <p>Este é um lembrete de que você tem um agendamento marcado para <strong>${dataFmt} às ${hora}</strong>.</p>
        <div class="info-box">
          <p style="margin: 5px 0;"><strong>📋 Serviço:</strong> ${
            agendamento.servico
          }</p>
          ${
            agendamento.observacoes
              ? `<p style="margin: 5px 0;"><strong>📝 Observações:</strong> ${agendamento.observacoes}</p>`
              : ""
          }
        </div>
        <p>Qualquer dúvida, entre em contato conosco.</p>
        <div class="footer">
          <p>Atenciosamente,<br><strong>Equipe de Agendamentos</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const from = `Sistema de Agendamentos <${getFromEmail()}>`;

  const resp = await resend.emails.send({
    from,
    to: agendamento.email,
    subject: "🔔 Lembrete: Agendamento",
    html: htmlEmail,
  });

  if (resp?.error) {
    throw new Error(resp.error.message || "Falha ao enviar email (Resend)");
  }

  return resp;
}

async function enviarWhatsAppTemplate(agendamento) {
  if (!agendamento.contato) {
    return;
  }

  if (!agendamento.usuarioId) {
    throw new Error("Agendamento sem usuarioId.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: agendamento.usuarioId },
    select: {
      wa_status: true,
      wa_phone_number_id: true,
      wa_access_token: true,
      wa_template_name: true,
      wa_template_language: true,
    },
  });

  if (!usuario) {
    throw new Error("Usuário do agendamento não encontrado.");
  }

  if (usuario.wa_status !== "connected") {
    throw new Error("WhatsApp do usuário não está conectado.");
  }

  if (!usuario.wa_phone_number_id || !usuario.wa_access_token) {
    throw new Error("Configuração incompleta de WhatsApp do usuário.");
  }

  if (!usuario.wa_template_name) {
    throw new Error("Template do WhatsApp não configurado para este usuário.");
  }

  const numeroDestino = normalizarTelefoneBR(agendamento.contato);

  if (!numeroDestino) {
    throw new Error(`Telefone inválido para WhatsApp: ${agendamento.contato}`);
  }

  const dataAgendamento = new Date(agendamento.data_agendamento);

  const hora = formatInTimeZone(dataAgendamento, TZ, "HH:mm", {
    locale: ptBR,
  });

  const dataFmt = formatInTimeZone(dataAgendamento, TZ, "dd/MM/yyyy", {
    locale: ptBR,
  });

  const accessToken = decrypt(usuario.wa_access_token);

  const response = await sendTemplate({
    phoneNumberId: usuario.wa_phone_number_id,
    accessToken,
    to: numeroDestino,
    templateName: usuario.wa_template_name,
    lang: usuario.wa_template_language || "pt_BR",
    components: [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: `${agendamento.nome} ${agendamento.sobrenome}`.trim(),
          },
          {
            type: "text",
            text: agendamento.servico || "Agendamento",
          },
          {
            type: "text",
            text: dataFmt,
          },
          {
            type: "text",
            text: hora,
          },
        ],
      },
    ],
  });

  return response;
}

function getJanelaAmanhaUtc() {
  const hojeNoTZ = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");

  const amanha00Utc = fromZonedTime(`${hojeNoTZ}T00:00:00`, TZ);
  amanha00Utc.setUTCDate(amanha00Utc.getUTCDate() + 1);

  const depoisDeAmanha00Utc = new Date(amanha00Utc);
  depoisDeAmanha00Utc.setUTCDate(depoisDeAmanha00Utc.getUTCDate() + 1);

  return { amanha00Utc, depoisDeAmanha00Utc };
}

async function enviarLembretes() {
  try {
    console.log("🔔 enviarLembretes() chamado | TZ =", TZ);

    const { amanha00Utc, depoisDeAmanha00Utc } = getJanelaAmanhaUtc();

    console.log(
      "📅 Janela UTC:",
      amanha00Utc.toISOString(),
      "->",
      depoisDeAmanha00Utc.toISOString()
    );

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data_agendamento: {
          gte: amanha00Utc,
          lt: depoisDeAmanha00Utc,
        },
        lembrete_enviado: false,
        status: {
          in: ["pendente", "confirmado"],
        },
        OR: [
          {
            email: {
              not: null,
            },
          },
          {
            contato: {
              not: null,
            },
          },
        ],
      },
    });

    console.log("🔎 Elegíveis encontrados:", agendamentos.length);

    let enviadosEmail = 0;
    let enviadosWhatsapp = 0;
    let falhasEmail = 0;
    let falhasWhatsapp = 0;

    for (const agendamento of agendamentos) {
      let emailEnviado = false;
      let whatsappEnviado = false;
    
      if (
        agendamento.email &&
        String(agendamento.email).trim() !== "" &&
        !agendamento.lembrete_email_enviado
      ) {
        try {
          const result = await enviarEmailLembrete(agendamento);
          enviadosEmail++;
          emailEnviado = true;
    
          console.log(
            `✅ Email enviado (Resend) para ${agendamento.email}`,
            result?.data?.id || ""
          );
        } catch (error) {
          falhasEmail++;
          console.error(
            `❌ Erro ao enviar email (Resend) para ${agendamento.email}:`,
            error?.response?.data || error?.message || error
          );
        }
      }
    
      if (
        agendamento.contato &&
        String(agendamento.contato).trim() !== "" &&
        !agendamento.lembrete_whatsapp_enviado
      ) {
        try {
          const result = await enviarWhatsAppTemplate(agendamento);
          enviadosWhatsapp++;
          whatsappEnviado = true;
    
          console.log(
            `✅ WhatsApp template enviado para ${agendamento.contato}`,
            result?.messages?.[0]?.id || ""
          );
        } catch (error) {
          falhasWhatsapp++;
          console.error(
            `❌ Erro ao enviar WhatsApp template para ${agendamento.contato}:`,
            error?.response?.data || error?.message || error
          );
    
          if (agendamento.usuarioId) {
            try {
              await prisma.usuario.update({
                where: { id: agendamento.usuarioId },
                data: {
                  wa_last_error: JSON.stringify(
                    error?.response?.data || error?.message || error
                  ),
                },
              });
            } catch {}
          }
        }
      }
    
      if (emailEnviado || whatsappEnviado) {
        await prisma.agendamento.update({
          where: { id: agendamento.id },
          data: {
            lembrete_email_enviado:
              agendamento.lembrete_email_enviado || emailEnviado,
            lembrete_whatsapp_enviado:
              agendamento.lembrete_whatsapp_enviado || whatsappEnviado,
            lembrete_enviado:
              (agendamento.lembrete_email_enviado || emailEnviado) ||
              (agendamento.lembrete_whatsapp_enviado || whatsappEnviado),
          },
        });
      }
    }

    console.log(
      `📊 Resumo lembretes | Email: ${enviadosEmail} enviados / ${falhasEmail} falhas | WhatsApp: ${enviadosWhatsapp} enviados / ${falhasWhatsapp} falhas | Elegíveis: ${agendamentos.length}`
    );
  } catch (error) {
    console.error("❌ Erro ao processar lembretes:", error);
  }
}

export function iniciarCronLembretes() {
  cron.schedule(
    "0 10 * * *",
    () => {
      console.log("🔔 Executando job de lembretes por email + WhatsApp...");
      enviarLembretes();
    },
    { timezone: TZ }
  );

  console.log(
    "⏰ Cron de lembretes iniciado (executa às 10:00 diariamente no timezone do app)"
  );
}

export async function executarLembretesAgora() {
  return enviarLembretes();
}

export async function sendReminderInteractive(to, agendamento) {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const confirmId = `confirm:${agendamento.id}`;
  const rescheduleId = `reschedule:${agendamento.id}`;
  const otherId = `other:${agendamento.id}`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text:
            `📅 Lembrete de agendamento\n` +
            `Cliente: ${agendamento.nome}\n` +
            `Data/Hora: ${agendamento.dataHora}\n\n` +
            `Selecione uma opção:`,
        },
        action: {
          buttons: [
            { type: "reply", reply: { id: confirmId, title: "✅ Confirmar" } },
            {
              type: "reply",
              reply: { id: rescheduleId, title: "🔁 Remarcar" },
            },
            { type: "reply", reply: { id: otherId, title: "❓ Outros" } },
          ],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}
