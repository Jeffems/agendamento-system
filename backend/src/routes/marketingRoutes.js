import express from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
const router = express.Router();
const permitidos = ["landing_view", "pricing_view", "signup_click", "login_click"];
router.post("/", async (req, res, next) => {
  try {
    const parsed = z.object({ evento: z.enum(permitidos), pagina: z.string().max(120).optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Evento inválido" });
    await prisma.marketingEvent.create({ data: parsed.data });
    return res.status(204).send();
  } catch (error) { return next(error); }
});
export default router;
