-- CreateIndex
CREATE INDEX "candidats_prenom_nom_idx" ON "candidats"("prenom", "nom");

-- CreateIndex
CREATE INDEX "candidats_localisation_idx" ON "candidats"("localisation");
