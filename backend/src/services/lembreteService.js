import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configure seu provedor de email aqui
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
