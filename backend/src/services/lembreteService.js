{/*import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configure seu provedor de email aqui
//const transporter = nodemailer.createTransport({
//  host: process.env.SMTP_HOST || "smtp.gmail.com",
//  port: process.env.SMTP_PORT || 587,
//  secure: false,
//  auth: {
//    user: process.env.SMTP_USER,
//    pass: process.env.SMTP_PASS,
//  },
//});
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,      // 465 = SSL
  requireTLS: smtpPort === 587,  // 587 = STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});
  async function enviarEmailLembrete(agendamento) {
  const dataAgendamento = new Date(agendamento.data_agendamento);
  const hora = dataAgendamento.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });


  const htmlEmail = `
    <!DOCTYPE html>
    <html>
    <head>
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
        <p>Este é um lembrete de que você tem um agendamento marcado para <strong>amanhã às ${hora}</strong>.</p>
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

  await transporter.sendMail({
    from: `"Sistema de Agendamentos" <${process.env.SMTP_USER}>`,
    to: agendamento.email,
    subject: "🔔 Lembrete: Agendamento para Amanhã",
    html: htmlEmail,
  });
}

async function enviarLembretes() {
  try {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);

    const depoisDeAmanha = new Date(amanha);
    depoisDeAmanha.setDate(depoisDeAmanha.getDate() + 1);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data_agendamento: {
          gte: amanha,
          lt: depoisDeAmanha,
        },
        lembrete_enviado: false,
        status: {
          in: ["pendente", "confirmado"],
        },
      },
    });

    for (const agendamento of agendamentos) {
      try {
        await enviarEmailLembrete(agendamento);

        await prisma.agendamento.update({
          where: { id: agendamento.id },
          data: { lembrete_enviado: true },
        });

        console.log(`✅ Email enviado para ${agendamento.email}`);
      } catch (error) {
        console.error(
          `❌ Erro ao enviar email para ${agendamento.email}:`,
          error
        );
      }
    }

    console.log(`📧 ${agendamentos.length} lembretes processados`);
  } catch (error) {
    console.error("❌ Erro ao processar lembretes:", error);
  }
}

export function iniciarCronLembretes() {
  // Executa todo dia às 10:00 da manhã
  cron.schedule("0 10 * * *", () => {
    console.log("🔔 Executando job de lembretes por email...");
    enviarLembretes();
  });

  console.log("⏰ Cron de lembretes iniciado (executa às 10:00 diariamente)");
}
*/}

import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

const prisma = new PrismaClient();

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromEmail() {
  // Para teste: onboarding@resend.dev
  // Em produção com domínio verificado: noreply@seudominio.com
  return process.env.EMAIL_FROM || "onboarding@resend.dev";
}

async function enviarEmailLembrete(agendamento) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const dataAgendamento = new Date(agendamento.data_agendamento);
  const TZ = process.env.APP_TIMEZONE || "America/Cuiaba";

  const hora = formatInTimeZone(dataAgendamento, TZ, "HH:mm", { locale: ptBR });

  const dataFmt = formatInTimeZone(dataAgendamento, TZ, "dd/MM/yyyy", { locale: ptBR });


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
        <p>Olá <strong>${agendamento.nome} ${agendamento.sobrenome}</strong>,</p>
        <p>Este é um lembrete de que você tem um agendamento marcado para <strong>${dataFmt} às ${hora}</strong>.</p>
        <div class="info-box">
          <p style="margin: 5px 0;"><strong>📋 Serviço:</strong> ${agendamento.servico}</p>
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
    subject: "🔔 Lembrete: Agendamento para Amanhã",
    html: htmlEmail,
  });

  if (resp?.error) {
    throw new Error(resp.error.message || "Falha ao enviar email (Resend)");
  }

  return resp;
}

async function enviarLembretes() {
  try {
// pega a data de hoje no timezone do sistema
const hojeNoTZ = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");

// cria amanhã 00:00 no timezone e converte para UTC
const amanha00Utc = zonedTimeToUtc(`${hojeNoTZ}T00:00:00`, TZ);
amanha00Utc.setUTCDate(amanha00Utc.getUTCDate() + 1);

// cria depois de amanhã 00:00 UTC
const depoisDeAmanha00Utc = new Date(amanha00Utc);
depoisDeAmanha00Utc.setUTCDate(depoisDeAmanha00Utc.getUTCDate() + 1);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        data_agendamento: {
          gte: amanha00Utc,
          lt:  depoisDeAmanha00Utc,
        },
        lembrete_enviado: false,
        status: {
          in: ["pendente", "confirmado"],
        },
        email: { not: null }, // ✅ NOVO: só pega quem tem email
        // se você tiver registros antigos com email "", dá pra reforçar assim:
        // NOT: { email: "" },
      },
    });

    let enviados = 0;
    let falhas = 0;

    for (const agendamento of agendamentos) {
      // ✅ Segurança extra (caso algum registro venha sem email)
      if (!agendamento.email) continue;

      try {
        const result = await enviarEmailLembrete(agendamento);

        await prisma.agendamento.update({
          where: { id: agendamento.id },
          data: { lembrete_enviado: true },
        });

        enviados++;
        console.log(
          `✅ Email enviado (Resend) para ${agendamento.email}`,
          result?.data?.id || ""
        );
      } catch (error) {
        falhas++;
        console.error(
          `❌ Erro ao enviar email (Resend) para ${agendamento.email}:`,
          error
        );
      }
    }

    console.log(`📧 Lembretes: ${enviados} enviados, ${falhas} falharam, ${agendamentos.length} elegíveis`);
  } catch (error) {
    console.error("❌ Erro ao processar lembretes:", error);
  }
}


export function iniciarCronLembretes() {
  // Executa todo dia às 10:00
  cron.schedule("0 10 * * *", () => {
    console.log("🔔 Executando job de lembretes por email (Resend)...");
    enviarLembretes();
  });

  console.log("⏰ Cron de lembretes iniciado (Resend) (executa às 10:00 diariamente)");
}

// Opcional: export para teste manual
export async function executarLembretesAgora() {
  return enviarLembretes();
}
