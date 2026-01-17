/*
  Warnings:

  - You are about to drop the column `whatsapp` on the `agendamentos` table. All the data in the column will be lost.
  - Added the required column `email` to the `agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "whatsapp",
ADD COLUMN     "email" TEXT NOT NULL;
