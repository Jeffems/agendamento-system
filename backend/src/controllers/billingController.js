import { z } from "zod";
import prisma from "../lib/prisma.js";
import { obterStripe, planoPorPriceId, planos } from "../lib/stripe.js";

function urlFrontend(caminho = "") { return `${String(process.env.FRONTEND_URL || "").replace(/\/$/, "")}${caminho}`; }
function timestamp(valor) { return valor ? new Date(valor * 1000) : null; }
function customerId(obj) { return typeof obj.customer === "string" ? obj.customer : obj.customer?.id; }

export function listarPlanos(req, res) {
  return res.json(Object.entries(planos).map(([id, p]) => ({ id, nome: p.nome, valor_centavos: p.valorCentavos(), moeda: "BRL", intervalo: "mes", recursos: p.recursos })));
}

export async function obterAssinatura(req, res) {
  const u = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: { plano: true, assinatura_status: true, trial_ends_at: true, assinatura_periodo_fim: true, cancelar_no_fim: true, stripe_customer_id: true } });
  const trialAtivo = u.assinatura_status === "trialing" && u.trial_ends_at > new Date();
  const admins = String(process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
  return res.json({ plano: u.plano, status: u.assinatura_status, trial_ends_at: u.trial_ends_at, periodo_fim: u.assinatura_periodo_fim, cancelar_no_fim: u.cancelar_no_fim, tem_assinatura: Boolean(u.stripe_customer_id), acesso_ativo: u.assinatura_status === "active" || trialAtivo, is_admin: admins.includes(String(req.user.email || "").toLowerCase()) });
}

export async function listarAssinaturasAdmin(req, res) {
  const admins = String(process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
  if (!admins.includes(String(req.user.email || "").toLowerCase())) return res.status(403).json({ error: "Acesso restrito a administradores" });
  const usuarios = await prisma.usuario.findMany({ orderBy: { created_at: "desc" }, select: { id: true, nome: true, email: true, nome_negocio: true, plano: true, assinatura_status: true, trial_ends_at: true, assinatura_periodo_fim: true, cancelar_no_fim: true, created_at: true } });
  const resumo = usuarios.reduce((acc, u) => { acc.total++; if (u.assinatura_status === "active") acc.ativas++; else if (u.assinatura_status === "trialing" && u.trial_ends_at > new Date()) acc.testes++; else acc.inativas++; return acc; }, { total: 0, ativas: 0, testes: 0, inativas: 0 });
  return res.json({ resumo, usuarios });
}

export async function criarCheckout(req, res) {
  const parsed = z.object({ plano: z.enum(["basico", "profissional"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Plano inválido" });
  const stripe = obterStripe();
  const plano = planos[parsed.data.plano];
  const priceId = plano.priceId();
  if (!priceId) return res.status(503).json({ error: "Preço do plano ainda não configurado" });
  let usuario = await prisma.usuario.findUnique({ where: { id: req.user.id } });
  if (usuario.stripe_subscription_id && ["active", "trialing", "past_due"].includes(usuario.assinatura_status)) return res.status(409).json({ error: "Gerencie a assinatura existente pelo Portal do Cliente", code: "USE_BILLING_PORTAL" });
  let customer = usuario.stripe_customer_id;
  if (!customer) {
    const criado = await stripe.customers.create({ email: usuario.email, name: usuario.nome || undefined, metadata: { usuarioId: usuario.id } });
    customer = criado.id;
    usuario = await prisma.usuario.update({ where: { id: usuario.id }, data: { stripe_customer_id: customer } });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", customer,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: urlFrontend("/assinatura?checkout=sucesso"),
    cancel_url: urlFrontend("/assinatura?checkout=cancelado"),
    metadata: { usuarioId: usuario.id, plano: parsed.data.plano },
    subscription_data: { metadata: { usuarioId: usuario.id, plano: parsed.data.plano } },
  });
  return res.json({ url: session.url });
}

export async function criarPortal(req, res) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id }, select: { stripe_customer_id: true } });
  if (!usuario?.stripe_customer_id) return res.status(400).json({ error: "Nenhuma assinatura encontrada" });
  const session = await obterStripe().billingPortal.sessions.create({ customer: usuario.stripe_customer_id, return_url: urlFrontend("/assinatura") });
  return res.json({ url: session.url });
}

async function sincronizarAssinatura(subscription) {
  const customer = customerId(subscription);
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const plano = planoPorPriceId(priceId) || subscription.metadata?.plano;
  const periodoFim = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;
  const where = subscription.metadata?.usuarioId ? { id: subscription.metadata.usuarioId } : { stripe_customer_id: customer };
  await prisma.usuario.updateMany({ where, data: { stripe_customer_id: customer, stripe_subscription_id: subscription.id, stripe_price_id: priceId, ...(plano ? { plano } : {}), assinatura_status: subscription.status, assinatura_periodo_fim: timestamp(periodoFim), cancelar_no_fim: Boolean(subscription.cancel_at_period_end || subscription.cancel_at) } });
}

export async function stripeWebhook(req, res) {
  const stripe = obterStripe();
  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET não configurado");
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (error) { return res.status(400).send(`Webhook inválido: ${error.message}`); }
  if (await prisma.stripeEvent.findUnique({ where: { id: event.id } })) return res.json({ received: true });
  try {
    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) await sincronizarAssinatura(event.data.object);
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      await prisma.usuario.updateMany({ where: { id: s.metadata?.usuarioId }, data: { stripe_customer_id: customerId(s), stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : s.subscription?.id, plano: s.metadata?.plano || "basico" } });
    }
    await prisma.stripeEvent.create({ data: { id: event.id, tipo: event.type } });
  } catch (error) {
    if (error.code !== "P2002") { console.error("Erro no webhook Stripe:", error); return res.status(500).json({ error: "Falha ao processar webhook" }); }
  }
  return res.json({ received: true });
}
