import express from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const administradores = String(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (!administradores.includes(String(req.user.email || "").toLowerCase())) {
      return res.status(403).json({
        error: "Apenas administradores podem criar convites",
      });
    }

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }

    const conviteExistente = await prisma.invite.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (conviteExistente) {
      return res.status(409).json({
        error: "Já existe um convite ativo para este email",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      },
    });

    return res.json({
      id: invite.id,
      inviteLink: `${process.env.FRONTEND_URL}/register?token=${token}`,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    console.error("Erro ao criar convite:", err);
    return res.status(500).json({ error: "Erro ao criar convite" });
  }
});

export default router;
