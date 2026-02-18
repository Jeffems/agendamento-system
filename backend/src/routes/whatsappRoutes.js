import express from "express";
import axios from "axios";

const router = express.Router();

// 1) Verificação do webhook (Meta)
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2) Recebimento de eventos (mensagens / cliques)
router.post("/webhook", async (req, res) => {
  console.log("📩 WhatsApp payload:", JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const msg = value?.messages?.[0];
    if (!msg) return res.sendStatus(200);

    const from = msg.from; // telefone do cliente (wa_id)
    const type = msg.type;

    // Clique em botão
    if (type === "interactive") {
      const btnId = msg.interactive?.button_reply?.id; // ex: "confirm:AG123"
      const btnTitle = msg.interactive?.button_reply?.title;

      // Exemplo: "confirm:123"
      const [action, agendamentoId] = (btnId || "").split(":");

      if (action && agendamentoId) {
        // TODO: atualizar seu banco conforme action
        // action: "confirm" | "reschedule" | "other"
        // await atualizarAgendamento(agendamentoId, action, from);

        // Responder conforme ação:
        let text = "Recebido ✅";
        if (action === "confirm") text = "✅ Agendamento confirmado! Obrigado.";
        if (action === "reschedule") text = "🔁 Ok! Me diga um novo dia e horário para remarcar.";
        if (action === "other") text = "❓ Pode me dizer o que você precisa?";

        await sendText(from, text);
      }
    }

    // Mensagem digitada (caso cliente responda texto)
    if (type === "text") {
      const body = msg.text?.body?.trim();
      // TODO: aqui você pode interpretar "1/2/3" também, se quiser fallback
      // await tratarTexto(from, body);
      await sendText(from, `Entendi: "${body}". Vou encaminhar ✅`);
    }

    return res.sendStatus(200);
  } catch (e) {
    console.error("Erro webhook WhatsApp:", e?.response?.data || e.message);
    return res.sendStatus(200); // sempre 200 pra evitar retry infinito
  }
});

async function sendText(to, text) {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
  );
}

export default router;
