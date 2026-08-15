
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
// import passport from "passport";

// import "./auth/passport.js";
import agendamentoRoutes from "./routes/agendamentoRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import configuracaoRoutes from "./routes/configuracaoRoutes.js";
import servicoRoutes from "./routes/servicoRoutes.js";
import publicAgendaRoutes from "./routes/publicAgendaRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import { stripeWebhook } from "./controllers/billingController.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { subscriptionMiddleware } from "./middlewares/subscriptionMiddleware.js";
import marketingRoutes from "./routes/marketingRoutes.js";
import prisma from "./lib/prisma.js";

import { iniciarCronLembretes } from "./services/lembreteService.js";
//import { executarLembretesAgora } from "./services/lembreteService.js";
//executarLembretesAgora();

//dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const variaveisObrigatorias = ["DATABASE_URL", "JWT_SECRET"];
const variaveisAusentes = variaveisObrigatorias.filter(
  (nome) => !process.env[nome]
);

if (variaveisAusentes.length > 0) {
  throw new Error(
    `Variáveis de ambiente obrigatórias ausentes: ${variaveisAusentes.join(", ")}`
  );
}

if (
  process.env.NODE_ENV === "production" &&
  String(process.env.JWT_SECRET).length < 32
) {
  throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres em produção");
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);


app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
  })
);

app.post("/api/billing/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(
  express.json({
    limit: "1mb",
    verify(req, res, buffer) {
      if (req.originalUrl === "/whatsapp/webhook") {
        req.rawBody = Buffer.from(buffer);
      }
    },
  })
);
// app.use(passport.initialize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas solicitações. Tente novamente em alguns minutos." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "ok",
      database: "connected",
      env: process.env.NODE_ENV || "development",
      timezone: process.env.APP_TIMEZONE || "America/Cuiaba",
    });
  } catch (error) {
    console.error("Falha no health check:", error?.message || error);
    return res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
app.use("/invite", apiLimiter, inviteRoutes);
app.use("/auth", authRoutes);
app.use("/api/billing", apiLimiter, billingRoutes);
app.use("/api/agendamentos", apiLimiter, authMiddleware, subscriptionMiddleware, agendamentoRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/api/clientes", apiLimiter, authMiddleware, subscriptionMiddleware, clienteRoutes);
app.use("/api/configuracoes", apiLimiter, authMiddleware, subscriptionMiddleware, configuracaoRoutes);
app.use("/api/servicos", apiLimiter, authMiddleware, subscriptionMiddleware, servicoRoutes);
app.use("/api/public/agenda", apiLimiter, publicAgendaRoutes);
app.use("/api/public/metrics", apiLimiter, marketingRoutes);
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);

  if (err?.message?.startsWith("CORS bloqueado")) {
    return res.status(403).json({ error: err.message });
  }

  return res.status(500).json({ error: "Erro interno do servidor" });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 FRONTEND_URL: ${process.env.FRONTEND_URL || "não definida"}`);
  console.log(`🕒 APP_TIMEZONE: ${process.env.APP_TIMEZONE || "America/Cuiaba"}`);
});

if (process.env.ENABLE_REMINDER_CRON !== "false") {
  iniciarCronLembretes();
}

async function encerrarServidor(sinal) {
  console.log(`Recebido ${sinal}. Encerrando servidor...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.once("SIGTERM", () => encerrarServidor("SIGTERM"));
process.once("SIGINT", () => encerrarServidor("SIGINT"));
