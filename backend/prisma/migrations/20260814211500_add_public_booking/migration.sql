ALTER TABLE "usuarios"
ADD COLUMN "slug" TEXT,
ADD COLUMN "agenda_publica_ativa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "intervalo_agendamento_min" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN "antecedencia_min_horas" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN "limite_agendamento_dias" INTEGER NOT NULL DEFAULT 60;

CREATE UNIQUE INDEX "usuarios_slug_key" ON "usuarios"("slug");
