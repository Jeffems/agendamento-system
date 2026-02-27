import express from "express";
import axios from "axios";

const router = express.Router();
console.log("✅ whatsappRoutes carregado");
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

        await enviarTexto(from, text);
      }
    }

    // Mensagem digitada (caso cliente responda texto)
    if (type === "text") {
      const body = msg.text?.body?.trim();
      // TODO: aqui você pode interpretar "1/2/3" também, se quiser fallback
      // await tratarTexto(from, body);
      await enviarTexto(from, `Entendi: "${body}". Vou encaminhar ✅`);
    }

    return res.sendStatus(200);
  } catch (e) {
    console.error("Erro webhook WhatsApp:", e?.response?.data || e.message);
    return res.sendStatus(200); // sempre 200 pra evitar retry infinito
  }
});

async function enviarTexto(to, text) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  return resp.data;
}

router.post("/test-send", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "Informe { to }" });

    const metaResp = await enviarTexto(to, "📅 Teste: seu lembrete do agendamento chegou!");

    return res.json({ ok: true, metaResp }); // ✅ agora vem wamid
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({
      error: "Falha ao enviar",
      details: err?.response?.data || err.message,
    });
  }
});

export default router;
