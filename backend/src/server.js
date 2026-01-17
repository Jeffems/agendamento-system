/*import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import { iniciarCronLembretes } from './services/lembreteService.js';
import passport from "./auth/passport.js";
import authRoutes from "./auth/authRoutes.js";

dotenv.config();

app.use(passport.initialize());
app.use("./auth", authRoutes);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/agendamentos', agendamentoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando!' });
});

// Iniciar cron job para lembretes
iniciarCronLembretes();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";

import "./auth/passport.js"; // importa e registra a estratégia
import agendamentoRoutes from "./routes/agendamentoRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import { iniciarCronLembretes } from "./services/lembreteService.js";

dotenv.config();

const app = express(); // ⚠️ TEM que vir ANTES de app.use
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🔐 Passport
app.use(passport.initialize());

// Rotas
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor rodando!" });
});

// Cron
iniciarCronLembretes();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
