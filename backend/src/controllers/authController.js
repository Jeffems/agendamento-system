import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TERMS_VERSION = process.env.TERMS_VERSION || "2026-02-10";
const PRIVACY_VERSION = process.env.PRIVACY_VERSION || "2026-02-10";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, nome: user.nome },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * ✅ Cadastro agora exige inviteToken (convite)
 */
const registerSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  inviteToken: z.string().min(10), // ✅ obrigatório
  accept: z.object({
    terms: z.literal(true),
    privacy: z.literal(true),
    marketing: z.boolean().optional().default(false),
  }),
});

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: parsed.error.flatten(),
    });
  }

  const { nome, email, password, inviteToken, accept } = parsed.data;

  // ✅ valida convite
  const invite = await prisma.invite.findUnique({
    where: { token: inviteToken },
  });

  if (!invite) {
    return res.status(403).json({ error: "Convite inválido." });
  }
  if (invite.usedAt) {
    return res.status(403).json({ error: "Convite já utilizado." });
  }
  if (invite.expiresAt < new Date()) {
    return res.status(403).json({ error: "Convite expirado." });
  }
  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    return res
      .status(403)
      .json({ error: "Este convite não é para este email." });
  }

  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.usuario.findUnique({ where: { email } });

  let user;
  const created = !existing;

  if (!existing) {
    // ✅ cria normal
    user = await prisma.usuario.create({
      data: {
        email,
        nome,
        password_hash: passwordHash,
        termos_aceitos_em: now,
        termos_versao: TERMS_VERSION,
        privacidade_aceita_em: now,
        privacidade_versao: PRIVACY_VERSION,
        marketing_aceito: accept.marketing ?? false,
        marketing_aceito_em: accept.marketing ? now : null,
      },
      select: { id: true, email: true, nome: true },
    });
  } else {
    // existe por email

    // se já tem senha, bloqueia re-cadastro
    if (existing.password_hash) {
      return res.status(409).json({ error: "Email já cadastrado. Faça login." });
    }

    // ✅ se existe sem senha (ex: Google), permite definir senha
    user = await prisma.usuario.update({
      where: { email },
      data: {
        password_hash: passwordHash,
        nome: existing.nome ?? nome,
        termos_aceitos_em: now,
        termos_versao: TERMS_VERSION,
        privacidade_aceita_em: now,
        privacidade_versao: PRIVACY_VERSION,
        marketing_aceito: accept.marketing ?? false,
        marketing_aceito_em: accept.marketing ? now : null,
      },
      select: { id: true, email: true, nome: true },
    });
  }

  // ✅ marca convite como usado
  await prisma.invite.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  });

  const token = signToken(user);

  return res.status(created ? 201 : 200).json({
    user,
    token,
    message: created ? "Conta criada com sucesso." : "Senha definida com sucesso.",
  });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });

  const { email, password } = parsed.data;

  const user = await prisma.usuario.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ error: "Email ou senha inválidos" });

  if (!user.password_hash) {
    return res.status(401).json({
      error:
        "Essa conta não tem senha ainda. Faça login com Google ou defina uma senha no cadastro.",
    });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Email ou senha inválidos" });

  // se por algum motivo não aceitou, bloqueia login
  if (!user.termos_aceitos_em || !user.privacidade_aceita_em) {
    return res
      .status(403)
      .json({ error: "É necessário aceitar os termos e a política de privacidade." });
  }

  const token = signToken(user);
  return res.json({
    user: { id: user.id, email: user.email, nome: user.nome },
    token,
  });
}

// retorna o usuário logado + flags de termos
export async function me(req, res) {
  const userId = req.userId;

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nome: true,
      termos_aceitos_em: true,
      privacidade_aceita_em: true,
      termos_versao: true,
      privacidade_versao: true,
      marketing_aceito: true,
    },
  });

  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  return res.json({
    user,
    needsTerms: !user.termos_aceitos_em || !user.privacidade_aceita_em,
  });
}

const acceptSchema = z.object({
  terms: z.literal(true),
  privacy: z.literal(true),
  marketing: z.boolean().optional().default(false),
});

export async function acceptTerms(req, res) {
  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Aceites inválidos" });

  const { marketing } = parsed.data;
  const now = new Date();

  await prisma.usuario.update({
    where: { id: req.userId },
    data: {
      termos_aceitos_em: now,
      termos_versao: TERMS_VERSION,
      privacidade_aceita_em: now,
      privacidade_versao: PRIVACY_VERSION,
      marketing_aceito: marketing ?? false,
      marketing_aceito_em: marketing ? now : null,
    },
  });

  return res.json({ ok: true });
}