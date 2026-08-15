# Etapa 5 — planos e assinatura Stripe

## Recursos

- teste grátis de 14 dias;
- planos Básico e Profissional;
- Stripe Checkout para contratação;
- Portal do Cliente para cartão, troca e cancelamento;
- webhooks com assinatura e idempotência;
- bloqueio amigável após perda de acesso;
- limite de 5 serviços no Básico;
- agenda pública e WhatsApp oficial no Profissional;
- painel administrativo de usuários e assinaturas.

## 1. Criar produtos e preços no Stripe

No modo de teste do Stripe, crie dois produtos com cobrança mensal recorrente:

- AgendaPro Básico — R$ 29,90/mês;
- AgendaPro Profissional — R$ 59,90/mês.

Copie os identificadores que começam com `price_`.

## 2. Configurar o Portal do Cliente

No Stripe, abra as configurações do Portal do Cliente. Habilite atualização de
forma de pagamento, troca de plano, consulta de faturas e cancelamento. Inclua
os dois produtos no catálogo permitido.

## 3. Criar o webhook

Cadastre este endpoint no Stripe:

```text
https://SEU-BACKEND.up.railway.app/api/billing/webhook
```

Selecione pelo menos os eventos:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

Copie o segredo de assinatura que começa com `whsec_`.

## 4. Variáveis da Railway

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
PLAN_BASIC_PRICE_CENTS=2990
PLAN_PROFESSIONAL_PRICE_CENTS=5990
```

Use somente chaves de teste até concluir todo o roteiro. Para produção, troque
simultaneamente a chave, os preços e o segredo do webhook por versões live.

## 5. Migration e deploy

Faça backup do PostgreSQL. A migration
`20260814223000_add_billing` adiciona campos de cobrança e a tabela de eventos
processados. Publique primeiro a Railway e depois a Vercel.

O backend recebeu a dependência `stripe`. Execute `npm install` para atualizar
o `package-lock.json` antes de enviar ao GitHub.

## 6. Testes obrigatórios

1. Acessar Assinatura e conferir os preços.
2. Contratar no modo de teste com o cartão `4242 4242 4242 4242`.
3. Confirmar o retorno à aplicação e o status ativo.
4. Conferir o evento entregue no painel do Stripe.
5. Abrir o Portal do Cliente.
6. Trocar de plano e confirmar a atualização por webhook.
7. Agendar cancelamento e confirmar o indicador no sistema.
8. Simular falha de pagamento e conferir o bloqueio.
9. Verificar o painel administrativo usando um e-mail de `ADMIN_EMAILS`.

## Segurança

- nunca coloque `sk_` ou `whsec_` no frontend ou GitHub;
- não use a chave live durante desenvolvimento;
- mantenha a verificação da assinatura do webhook;
- não marque manualmente uma assinatura como paga pelo frontend.
