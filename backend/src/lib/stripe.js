import Stripe from "stripe";

let cliente;
export function obterStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe não configurado");
  if (!cliente) cliente = new Stripe(process.env.STRIPE_SECRET_KEY);
  return cliente;
}

export const planos = {
  basico: {
    nome: "Básico",
    priceId: () => process.env.STRIPE_PRICE_BASIC,
    valorCentavos: () => Number(process.env.PLAN_BASIC_PRICE_CENTS || 2990),
    recursos: ["Agenda e clientes", "Até 5 serviços", "Lembretes por e-mail"],
  },
  profissional: {
    nome: "Profissional",
    priceId: () => process.env.STRIPE_PRICE_PROFESSIONAL,
    valorCentavos: () => Number(process.env.PLAN_PROFESSIONAL_PRICE_CENTS || 5990),
    recursos: ["Serviços ilimitados", "Agenda pública", "WhatsApp e recursos avançados"],
  },
};

export function planoPorPriceId(priceId) {
  return Object.entries(planos).find(([, plano]) => plano.priceId() === priceId)?.[0] || null;
}
