import prisma from "../lib/prisma.js";

export async function subscriptionMiddleware(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: { plano: true, assinatura_status: true, trial_ends_at: true } });
    if (!usuario) return res.status(401).json({ error: "Usuário não encontrado" });
    const ativo = usuario.assinatura_status === "active" || (usuario.assinatura_status === "trialing" && usuario.trial_ends_at > new Date());
    if (!ativo) return res.status(402).json({ error: "Assinatura necessária para continuar", code: "SUBSCRIPTION_REQUIRED" });
    req.subscription = usuario;
    return next();
  } catch (error) { return next(error); }
}

export function professionalFeatureMiddleware(req, res, next) {
  if (req.subscription?.plano === "profissional" || req.subscription?.plano === "teste") return next();
  return res.status(403).json({ error: "Recurso disponível no plano Profissional", code: "PLAN_UPGRADE_REQUIRED" });
}
