-- Evita que duas instâncias enviem o mesmo lembrete simultaneamente.
ALTER TABLE "agendamentos"
ADD COLUMN "lembrete_email_processando_em" TIMESTAMPTZ(6),
ADD COLUMN "lembrete_whatsapp_processando_em" TIMESTAMPTZ(6);
