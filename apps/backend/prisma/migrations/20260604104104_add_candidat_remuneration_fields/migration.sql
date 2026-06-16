-- AlterTable
ALTER TABLE "candidats" ADD COLUMN     "avantagesSociaux" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pretentionsSalariales" TEXT,
ADD COLUMN     "primes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salaireActuel" TEXT,
ADD COLUMN     "vehiculeFonction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vehiculeService" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "admin_candidat_notes" (
    "id" SERIAL NOT NULL,
    "candidatId" INTEGER NOT NULL,
    "qualifie" BOOLEAN NOT NULL DEFAULT false,
    "compteRendu" TEXT,
    "pieceJointeUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_candidat_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_candidat_notes_candidatId_key" ON "admin_candidat_notes"("candidatId");

-- AddForeignKey
ALTER TABLE "admin_candidat_notes" ADD CONSTRAINT "admin_candidat_notes_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
