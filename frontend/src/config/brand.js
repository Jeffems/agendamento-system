export const brand = {
  name: import.meta.env.VITE_APP_NAME || "AgendaPro",
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "suporte@seudominio.com.br",
  privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL || import.meta.env.VITE_SUPPORT_EMAIL || "privacidade@seudominio.com.br",
  legalName: import.meta.env.VITE_LEGAL_NAME || "[RAZÃO SOCIAL A DEFINIR]",
  legalDocument: import.meta.env.VITE_LEGAL_DOCUMENT || "[CNPJ/CPF A DEFINIR]",
  legalAddress: import.meta.env.VITE_LEGAL_ADDRESS || "[ENDEREÇO A DEFINIR]",
  basicPrice: Number(import.meta.env.VITE_PLAN_BASIC_PRICE_CENTS || 2990),
  professionalPrice: Number(import.meta.env.VITE_PLAN_PROFESSIONAL_PRICE_CENTS || 5990),
  legalVersion: import.meta.env.VITE_LEGAL_VERSION || "14 de agosto de 2026",
};
