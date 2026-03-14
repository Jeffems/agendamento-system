import prisma from "../lib/prisma.js";
import { sendText, sendTemplate } from "../services/whatsappService.js";
import { encrypt, decrypt } from "../utils/crypto.js";

function normalizarTelefoneBR(numero) {
  if (!numero) return null;

  let digits = String(numero).replace(/\D/g, "");

  if (!digits) return null;

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }

  if (digits.length < 12 || digits.length > 13) {
    return null;
  }

  return digits;
}

export async function getMyWhatsApp(req, res) {
  try {
    const userId = req.userId;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        wa_status: true,
        wa_waba_id: true,
        wa_phone_number_id: true,
        wa_display_phone_number: true,
        wa_template_name: true,
        wa_template_language: true,
        wa_connected_at: true,
        wa_last_error: true,
      },
    });

    return res.json({ ok: true, whatsapp: user });
  } catch (err) {
    console.error("getMyWhatsApp error:", err);
    return res
      .status(500)
      .json({ error: "Erro ao buscar status do WhatsApp." });
  }
}

export async function connectWhatsApp(req, res) {
  try {
    const userId = req.userId;
    const {
      wabaId,
      phoneNumberId,
      displayPhoneNumber,
      accessToken,
      templateName,
      templateLanguage,
    } = req.body;

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({
        error: "phoneNumberId e accessToken são obrigatórios.",
      });
    }

    if (!templateName) {
      return res.status(400).json({
        error: "templateName é obrigatório.",
      });
    }

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: {
        wa_status: "connected",
        wa_waba_id: wabaId ?? null,
        wa_phone_number_id: phoneNumberId,
        wa_display_phone_number: displayPhoneNumber ?? null,
        wa_access_token: encrypt(accessToken),
        wa_template_name: templateName,
        wa_template_language: templateLanguage || "pt_BR",
        wa_connected_at: new Date(),
        wa_last_error: null,
      },
      select: {
        id: true,
        wa_status: true,
        wa_phone_number_id: true,
        wa_display_phone_number: true,
        wa_template_name: true,
        wa_template_language: true,
      },
    });

    return res.json({ ok: true, whatsapp: updated });
  } catch (err) {
    console.error("connectWhatsApp error:", err);
    return res.status(500).json({ error: "Erro ao conectar WhatsApp." });
  }
}

export async function sendTest(req, res) {
  try {
    const userId = req.userId;
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        error: "Informe { to } com DDI. Ex: 5566999999999",
      });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        wa_phone_number_id: true,
        wa_access_token: true,
        wa_status: true,
        wa_template_name: true,
        wa_template_language: true,
      },
    });

    if (!user?.wa_phone_number_id || !user?.wa_access_token) {
      return res.status(400).json({
        error: "WhatsApp não conectado para este usuário.",
      });
    }

    if (!user?.wa_template_name) {
      return res.status(400).json({
        error: "Template não configurado para este usuário.",
      });
    }

    const numeroDestino = normalizarTelefoneBR(to);

    if (!numeroDestino) {
      return res.status(400).json({
        error: "Telefone inválido. Use formato 5566999999999",
      });
    }

    const accessToken = decrypt(user.wa_access_token);

    const metaResp = await sendTemplate({
      phoneNumberId: user.wa_phone_number_id,
      accessToken,
      to: numeroDestino,
      templateName: user.wa_template_name,
      lang: user.wa_template_language || "pt_BR",
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              parameter_name: "nome",
              text: "Cliente Teste",
            },
            {
              type: "text",
              parameter_name: "servico",
              text: "Serviço Teste",
            },
            {
              type: "text",
              parameter_name: "dia",
              text: "10/03/2026",
            },
            {
              type: "text",
              parameter_name: "horas",
              text: "14:00",
            },
          ],
        },
      ],
    });

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        wa_status: "connected",
        wa_last_error: null,
      },
    });

    return res.json({ ok: true, metaResp });
  } catch (err) {
    console.error("sendTest error:", err?.response?.data || err);

    try {
      await prisma.usuario.update({
        where: { id: req.userId },
        data: {
          wa_last_error: JSON.stringify(
            err?.response?.data || err?.message || err
          ),
        },
      });
    } catch {}

    return res.status(500).json({
      error: "Falha ao enviar teste.",
      details: err?.response?.data || err.message,
    });
  }
}

export async function disconnectWhatsApp(req, res) {
  try {
    const userId = req.userId;

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        wa_status: "not_connected",
        wa_waba_id: null,
        wa_phone_number_id: null,
        wa_display_phone_number: null,
        wa_access_token: null,
        wa_template_name: null,
        wa_template_language: "pt_BR",
        wa_connected_at: null,
        wa_last_error: null,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("disconnectWhatsApp error:", err);
    return res.status(500).json({ error: "Erro ao desconectar WhatsApp." });
  }
}

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

    console.log("📩 webhook tenant userId:", user.id);

    return res.sendStatus(200);
  } catch (err) {
    console.error("webhookHandler error:", err);
    return res.sendStatus(200);
  }
}
