-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CANDIDAT', 'ENTREPRISE', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutOffre" AS ENUM ('EN_ATTENTE', 'OUVERTE', 'FERMEE');

-- CreateEnum
CREATE TYPE "StatutCandidature" AS ENUM ('EN_ATTENTE', 'VUE', 'ENTRETIEN', 'ACCEPTE', 'REFUSE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidats" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "localisation" TEXT,
    "titre" TEXT,
    "bio" TEXT,
    "cvUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entreprises" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "secteur" TEXT,
    "siteWeb" TEXT,
    "logoUrl" TEXT,
    "localisation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entreprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competences" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "competences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_offres" (
    "offreId" INTEGER NOT NULL,
    "competenceId" INTEGER NOT NULL,

    CONSTRAINT "competence_offres_pkey" PRIMARY KEY ("offreId","competenceId")
);

-- CreateTable
CREATE TABLE "competence_candidats" (
    "candidatId" INTEGER NOT NULL,
    "competenceId" INTEGER NOT NULL,
    "niveau" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "competence_candidats_pkey" PRIMARY KEY ("candidatId","competenceId")
);

-- CreateTable
CREATE TABLE "offres" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type_contrat" TEXT NOT NULL,
    "niveau_experience" TEXT,
    "localisation" TEXT,
    "salaire_min" INTEGER,
    "salaire_max" INTEGER,
    "statut" "StatutOffre" NOT NULL DEFAULT 'EN_ATTENTE',
    "entrepriseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatures" (
    "id" SERIAL NOT NULL,
    "candidatId" INTEGER NOT NULL,
    "offreId" INTEGER NOT NULL,
    "statut" "StatutCandidature" NOT NULL DEFAULT 'EN_ATTENTE',
    "lettre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidats_utilisateurId_key" ON "candidats"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "entreprises_utilisateurId_key" ON "entreprises"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "competences_nom_key" ON "competences"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "candidatures_candidatId_offreId_key" ON "candidatures"("candidatId", "offreId");

-- AddForeignKey
ALTER TABLE "candidats" ADD CONSTRAINT "candidats_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_offres" ADD CONSTRAINT "competence_offres_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "offres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_offres" ADD CONSTRAINT "competence_offres_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "competences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_candidats" ADD CONSTRAINT "competence_candidats_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_candidats" ADD CONSTRAINT "competence_candidats_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "competences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offres" ADD CONSTRAINT "offres_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "candidats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "offres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
