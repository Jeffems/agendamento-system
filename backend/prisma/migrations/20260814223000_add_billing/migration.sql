ALTER TABLE "usuarios"
ADD COLUMN "plano" TEXT NOT NULL DEFAULT 'teste',
ADD COLUMN "assinatura_status" TEXT NOT NULL DEFAULT 'trialing',
ADD COLUMN "trial_ends_at" TIMESTAMPTZ(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP + interval '14 days'),
ADD COLUMN "stripe_customer_id" TEXT,
ADD COLUMN "stripe_subscription_id" TEXT,
ADD COLUMN "stripe_price_id" TEXT,
ADD COLUMN "assinatura_periodo_fim" TIMESTAMPTZ(6),
ADD COLUMN "cancelar_no_fim" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "usuarios_stripe_customer_id_key" ON "usuarios"("stripe_customer_id");
CREATE UNIQUE INDEX "usuarios_stripe_subscription_id_key" ON "usuarios"("stripe_subscription_id");

CREATE TABLE "stripe_events" (
  "id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "processado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);
