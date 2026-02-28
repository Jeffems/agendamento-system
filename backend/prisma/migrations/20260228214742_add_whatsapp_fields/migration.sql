/*
  Warnings:

  - A unique constraint covering the columns `[wa_phone_number_id]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "lembrete_email_enviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lembrete_whatsapp_enviado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "wa_access_token" TEXT,
ADD COLUMN     "wa_connected_at" TIMESTAMP(3),
ADD COLUMN     "wa_display_phone_number" TEXT,
ADD COLUMN     "wa_last_error" TEXT,
ADD COLUMN     "wa_phone_number_id" TEXT,
ADD COLUMN     "wa_status" TEXT NOT NULL DEFAULT 'not_connected',
ADD COLUMN     "wa_waba_id" TEXT;

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_wa_phone_number_id_key" ON "usuarios"("wa_phone_number_id");
