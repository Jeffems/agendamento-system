-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "marketing_aceito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketing_aceito_em" TIMESTAMP(3),
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "privacidade_aceita_em" TIMESTAMP(3),
ADD COLUMN     "privacidade_versao" TEXT,
ADD COLUMN     "termos_aceitos_em" TIMESTAMP(3),
ADD COLUMN     "termos_versao" TEXT,
ALTER COLUMN "google_id" DROP NOT NULL,
ALTER COLUMN "nome" DROP NOT NULL;
