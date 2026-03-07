/*
  Warnings:

  - The `status` column on the `agendamentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('pendente', 'confirmado', 'concluido', 'cancelado');

-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "duracao_min" INTEGER NOT NULL DEFAULT 60,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusAgendamento" NOT NULL DEFAULT 'pendente';

-- CreateIndex
CREATE INDEX "agendamentos_usuarioId_idx" ON "agendamentos"("usuarioId");

-- CreateIndex
CREATE INDEX "agendamentos_data_agendamento_idx" ON "agendamentos"("data_agendamento");

-- CreateIndex
CREATE INDEX "agendamentos_usuarioId_data_agendamento_idx" ON "agendamentos"("usuarioId", "data_agendamento");
