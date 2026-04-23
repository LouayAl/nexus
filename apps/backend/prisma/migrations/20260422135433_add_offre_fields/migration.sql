-- AlterTable
ALTER TABLE "offres" ADD COLUMN     "langues" TEXT[],
ADD COLUMN     "profil_recherche" TEXT,
ADD COLUMN     "salaire_visible" BOOLEAN NOT NULL DEFAULT true;
