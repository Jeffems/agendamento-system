ALTER TABLE "usuarios"
ADD COLUMN "nome_negocio" TEXT,
ADD COLUMN "telefone_negocio" TEXT,
ADD COLUMN "endereco_negocio" TEXT,
ADD COLUMN "logo_url" TEXT,
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Cuiaba',
ADD COLUMN "horarios_funcionamento" JSONB,
ADD COLUMN "lembrete_email_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lembrete_whatsapp_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "onboarding_concluido" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "servicos" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "preco" DECIMAL(10,2),
  "duracao_min" INTEGER NOT NULL DEFAULT 60,
  "cor" TEXT NOT NULL DEFAULT '#4f46e5',
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "agendamentos" ADD COLUMN "servicoId" TEXT;
CREATE INDEX "servicos_usuarioId_ativo_idx" ON "servicos"("usuarioId", "ativo");
CREATE INDEX "agendamentos_servicoId_idx" ON "agendamentos"("servicoId");
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
