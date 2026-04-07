// frontend/src/app/admin/components/CandidatDetailModal.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Mail, Phone, Briefcase, GraduationCap, Globe,
  Star, FileText, Loader2, Calendar, Building2, ExternalLink,
} from "lucide-react";
import { Modal } from "./Modal";
import { adminApi, type CandidatAdmin } from "@/lib/api";

const statutColors: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE: { color: "#EE813D", bg: "rgba(238,129,61,0.1)", label: "En attente" },
  VUE:        { color: "#2284C0", bg: "rgba(34,132,192,0.1)", label: "Vue" },
  ENTRETIEN:  { color: "#7C3AED", bg: "rgba(124,58,237,0.1)", label: "Entretien" },
  ACCEPTE:    { color: "#1A9E6F", bg: "rgba(26,158,111,0.1)", label: "Accepté" },
  REFUSE:     { color: "#D64045", bg: "rgba(214,64,69,0.1)",  label: "Refusé" },
};

const niveauLangLabel: Record<string, string> = {
  Débutant: "A1-A2", Intermédiaire: "B1-B2", Avancé: "C1", Natif: "Natif",
};

export function CandidatDetailModal({
  candidatId,
  onClose,
}: {
  candidatId: number;
  onClose: () => void;
}) {
  const { data: candidat, isLoading } = useQuery({
    queryKey: ["admin-candidat", candidatId],
    queryFn: () => adminApi.getCandidatById(candidatId).then((r) => r.data),
  });

  return (
    <Modal title="Profil candidat" onClose={onClose} wide>
      {isLoading || !candidat ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement du profil…</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Hero ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #10406B 0%, #2284C0 100%)",
              borderRadius: 16, padding: "24px 24px 20px",
              display: "flex", gap: 18, alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, fontWeight: 900, color: "white", fontFamily: "'Fraunces',serif",
                border: "2px solid rgba(255,255,255,0.25)",
              }}
            >
              {candidat.prenom.charAt(0)}{candidat.nom.charAt(0)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 2, fontFamily: "'Fraunces',serif" }}>
                {candidat.prenom} {candidat.nom}
              </div>
              {candidat.titre && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>{candidat.titre}</div>
              )}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {candidat.utilisateur?.email && (
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Mail size={11} />{candidat.utilisateur.email}
                  </span>
                )}
                {candidat.telephone && (
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Phone size={11} />{candidat.telephone}
                  </span>
                )}
                {candidat.localisation && (
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} />{candidat.localisation}
                  </span>
                )}
              </div>
            </div>

            {/* CV link */}
            {candidat.cvUrl && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001"}${candidat.cvUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                  color: "white", fontSize: 12, fontWeight: 600,
                  textDecoration: "none", flexShrink: 0,
                }}
              >
                <FileText size={13} /> CV <ExternalLink size={11} />
              </a>
            )}
          </div>

          {/* ── Stats row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { label: "Candidatures", value: candidat.candidatures?.length ?? 0, color: "#2284C0" },
              { label: "Compétences",  value: candidat.competences?.length ?? 0,  color: "#1A9E6F" },
              { label: "Expériences",  value: candidat.experiences?.length ?? 0,  color: "#EE813D" },
              { label: "Formations",   value: candidat.formations?.length ?? 0,   color: "#7C3AED" },
            ].map((s) => (
              <div
                key={s.label}
                style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 10px", textAlign: "center", border: "1px solid rgba(16,64,107,0.07)" }}
              >
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: "'Fraunces',serif" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#5A7A96", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Bio ── */}
          {candidat.bio && (
            <div>
              <SectionTitle>À propos</SectionTitle>
              <p style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.75, margin: 0 }}>{candidat.bio}</p>
            </div>
          )}

          {/* ── Compétences ── */}
          {(candidat.competences?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Star size={13} />}>Compétences</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {candidat.competences!.map((c) => (
                  <div key={c.competenceId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 110, fontSize: 12, fontWeight: 600, color: "#0D2137", flexShrink: 0 }}>{c.competence.nom}</div>
                    <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(16,64,107,0.08)" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: `${c.niveau}%`, background: "linear-gradient(90deg, #10406B, #2284C0)", transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#5A7A96", width: 32, textAlign: "right" }}>{c.niveau}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Expériences ── */}
          {(candidat.experiences?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Briefcase size={13} />}>Expériences</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {candidat.experiences!.map((exp) => (
                  <div key={exp.id} style={{ padding: "14px 16px", background: "#F7F8FA", borderRadius: 12, border: "1px solid rgba(16,64,107,0.06)", borderLeft: "3px solid #2284C0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0D2137" }}>{exp.poste}</div>
                        <div style={{ fontSize: 12, color: "#2284C0", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Building2 size={10} />{exp.entreprise}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <Calendar size={10} />
                        {exp.dateDebut} → {exp.actuel ? "Présent" : (exp.dateFin ?? "?")}
                      </div>
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: 12, color: "#5A7A96", margin: "8px 0 0", lineHeight: 1.6 }}>{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Formations ── */}
          {(candidat.formations?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<GraduationCap size={13} />}>Formations</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {candidat.formations!.map((f) => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F7F8FA", borderRadius: 10, border: "1px solid rgba(16,64,107,0.06)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0D2137" }}>{f.diplome}</div>
                      <div style={{ fontSize: 12, color: "#5A7A96" }}>{f.ecole}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2284C0" }}>{f.annee}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Langues ── */}
          {(candidat.langues?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Globe size={13} />}>Langues</SectionTitle>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {candidat.langues!.map((l) => (
                  <div
                    key={l.id}
                    style={{ padding: "8px 14px", borderRadius: 10, background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#0D2137" }}>{l.nom}</span>
                    <span style={{ fontSize: 11, color: "#5A7A96", background: "rgba(16,64,107,0.06)", padding: "2px 7px", borderRadius: 6 }}>
                      {niveauLangLabel[l.niveau] ?? l.niveau}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Candidatures ── */}
          <div>
            <SectionTitle icon={<Briefcase size={13} />}>
              Offres postulées ({candidat.candidatures?.length ?? 0})
            </SectionTitle>
            {(candidat.candidatures?.length ?? 0) === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "#B0C4D4", fontSize: 13 }}>
                Aucune candidature pour le moment.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {candidat.candidatures!.map((cand) => {
                  const sc = statutColors[cand.statut] ?? statutColors.EN_ATTENTE;
                  return (
                    <div
                      key={cand.id}
                      style={{
                        padding: "14px 16px", background: "white", borderRadius: 12,
                        border: "1px solid rgba(16,64,107,0.08)",
                        boxShadow: "0 1px 4px rgba(16,64,107,0.05)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0D2137", marginBottom: 3 }}>
                            {cand.offre?.titre ?? `Offre #${cand.offreId}`}
                          </div>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {cand.offre?.entreprise?.nom && (
                              <span style={{ fontSize: 12, color: "#2284C0", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                                <Building2 size={10} />{cand.offre.entreprise.nom}
                              </span>
                            )}
                            {cand.offre?.type_contrat && (
                              <span style={{ fontSize: 12, color: "#5A7A96" }}>{cand.offre.type_contrat}</span>
                            )}
                            {cand.offre?.localisation && (
                              <span style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 3 }}>
                                <MapPin size={10} />{cand.offre.localisation}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                            {sc.label}
                          </span>
                          <span style={{ fontSize: 11, color: "#B0C4D4", display: "flex", alignItems: "center", gap: 3 }}>
                            <Calendar size={9} />
                            {new Date(cand.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      {cand.lettre && (
                        <div style={{ marginTop: 10, padding: "10px 12px", background: "#F7F8FA", borderRadius: 8, fontSize: 12, color: "#5A7A96", lineHeight: 1.6, borderLeft: "3px solid rgba(34,132,192,0.3)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#B0C4D4", marginBottom: 4 }}>Lettre de motivation</div>
                          {cand.lettre.length > 200 ? cand.lettre.slice(0, 200) + "…" : cand.lettre}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </Modal>
  );
}

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
      {icon && <span style={{ color: "#5A7A96" }}>{icon}</span>}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96" }}>
        {children}
      </div>
    </div>
  );
}