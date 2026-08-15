CREATE TABLE "marketing_events" (
  "id" TEXT NOT NULL,
  "evento" TEXT NOT NULL,
  "pagina" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "marketing_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "marketing_events_evento_created_at_idx" ON "marketing_events"("evento", "created_at");
