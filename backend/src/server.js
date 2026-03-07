{/*
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";

import "./auth/passport.js";
import agendamentoRoutes from "./routes/agendamentoRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";

import { iniciarCronLembretes } from "./services/lembreteService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Passport init
app.use(passport.initialize());

// Rotas
app.use("/invite", inviteRoutes);
app.use("/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/whatsapp", whatsappRoutes);

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor rodando!" });
});

// Cron
iniciarCronLembretes();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
*/}

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";

import "./auth/passport.js";
import agendamentoRoutes from "./routes/agendamentoRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";

import { iniciarCronLembretes } from "./services/lembreteService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

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

app.use(express.json({ limit: "1mb" }));
app.use(passport.initialize());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor rodando!",
    env: process.env.NODE_ENV || "development",
    timezone: process.env.APP_TIMEZONE || "America/Cuiaba",
  });
});

app.use("/invite", inviteRoutes);
app.use("/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/whatsapp", whatsappRoutes);

app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);

  if (err?.message?.startsWith("CORS bloqueado")) {
    return res.status(403).json({ error: err.message });
  }

  return res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 FRONTEND_URL: ${process.env.FRONTEND_URL || "não definida"}`);
  console.log(`🕒 APP_TIMEZONE: ${process.env.APP_TIMEZONE || "America/Cuiaba"}`);
});

if (process.env.ENABLE_REMINDER_CRON !== "false") {
  iniciarCronLembretes();
}