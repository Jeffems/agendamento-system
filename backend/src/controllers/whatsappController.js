import { PrismaClient } from "@prisma/client";
import { sendText } from "../services/whatsappService.js";

const prisma = new PrismaClient();

/**
 * POST /whatsapp/connect
 * body: { wabaId?, phoneNumberId, displayPhoneNumber?, accessToken }
 */
export async function connectWhatsApp(req, res) {
  try {
    const userId = req.userId;
    const { wabaId, phoneNumberId, displayPhoneNumber, accessToken } = req.body;

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({ error: "phoneNumberId e accessToken são obrigatórios." });
    }

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: {
        wa_status: "connected",
        wa_waba_id: wabaId ?? null,
        wa_phone_number_id: phoneNumberId,
        wa_display_phone_number: displayPhoneNumber ?? null,
        wa_access_token: accessToken, // depois a gente criptografa
        wa_connected_at: new Date(),
        wa_last_error: null,
      },
      select: {
        id: true,
        wa_status: true,
        wa_phone_number_id: true,
        wa_display_phone_number: true,
      },
    });

    return res.json({ ok: true, whatsapp: updated });
  } catch (err) {
    console.error("connectWhatsApp error:", err);
    return res.status(500).json({ error: "Erro ao conectar WhatsApp." });
  }
}

/**
 * POST /whatsapp/send-test
 * body: { to }
 */
export async function sendTest(req, res) {
  try {
    const userId = req.userId;
    const { to } = req.body;

    if (!to) return res.status(400).json({ error: "Informe { to } com DDI. Ex: 5566999999999" });

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { wa_phone_number_id: true, wa_access_token: true, wa_status: true },
    });

    if (!user?.wa_phone_number_id || !user?.wa_access_token) {
      return res.status(400).json({ error: "WhatsApp não conectado para este usuário." });
    }

    const metaResp = await sendText({
      phoneNumberId: user.wa_phone_number_id,
      accessToken: user.wa_access_token,
      to,
      text: "✅ Teste enviado com seu número conectado no SaaS.",
    });

    return res.json({ ok: true, metaResp });
  } catch (err) {
    console.error("sendTest error:", err?.response?.data || err);
    return res.status(500).json({ error: "Falha ao enviar teste.", details: err?.response?.data || err.message });
  }
}

/**
 * POST /whatsapp/webhook
 * Multi-tenant: identifica o dono pelo metadata.phone_number_id
 */
export async function webhookHandler(req, res) {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const phoneNumberId = value?.metadata?.phone_number_id;
    if (!phoneNumberId) return res.sendStatus(200);

    const user = await prisma.usuario.findFirst({
      where: { wa_phone_number_id: phoneNumberId },
      select: { id: true },
    });

    if (!user) return res.sendStatus(200);

    // Aqui você processa mensagens / cliques por TENANT (user.id)
    // value.messages, value.statuses, etc.
    console.log("📩 webhook tenant userId:", user.id);

    return res.sendStatus(200);
  } catch (err) {
    console.error("webhookHandler error:", err);
    return res.sendStatus(200);
  }
}