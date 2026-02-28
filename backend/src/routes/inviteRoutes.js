import express from "express";
import crypto from "crypto";
import prisma from "../prisma/client.js";

const router = express.Router();

// gerar convite
router.post("/create", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 dias
      },
    });

    return res.json({
      inviteLink: `https://agendamento-system.vercel.app/register?token=${token}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar convite" });
  }
});

export default router;