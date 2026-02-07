-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "contato" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
