import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { connectWhatsApp, sendTest, webhookHandler } from "../controllers/whatsappController.js";

const router = express.Router();
console.log("✅ whatsappRoutes carregado");

// Verificação do webhook (Meta)
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recebimento de eventos (multi-tenant)
router.post("/webhook", webhookHandler);

// Conectar WhatsApp por usuário (multi-conta)
router.post("/connect", authMiddleware, connectWhatsApp);

// Enviar teste com credenciais do usuário logado
router.post("/send-test", authMiddleware, sendTest);

export default router;