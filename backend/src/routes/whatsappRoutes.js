import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  connectWhatsApp,
  sendTest,
  webhookHandler,
  getMyWhatsApp,
  disconnectWhatsApp,
} from "../controllers/whatsappController.js";

const router = express.Router();
console.log("✅ whatsappRoutes carregado");

router.get("/me", authMiddleware, getMyWhatsApp);

router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post("/webhook", webhookHandler);

router.post("/connect", authMiddleware, connectWhatsApp);
router.post("/send-test", authMiddleware, sendTest);
router.delete("/disconnect", authMiddleware, disconnectWhatsApp);

export default router;