-- CreateTable
CREATE TABLE "experiences" (
    "id" SERIAL NOT NULL,
    "candidatId" INTEGER NOT NULL,
    "poste" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "dateDebut" TEXT NOT NULL,
    "dateFin" TEXT,
    "actuel" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" SERIAL NOT NULL,
    "candidatId" INTEGER NOT NULL,
    "diplome" TEXT NOT NULL,
    "ecole" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "langues" (
    "id" SERIAL NOT NULL,
    "candidatId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "langues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "langues" ADD CONSTRAINT "langues_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
