// frontend/src/app/admin/entreprises/[id]/offres/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { adminApi, type Offre } from "@/lib/api";
import toast from "react-hot-toast";
import { OffreEditPanel } from "./OffreEditPanel";

const STATUT_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  OUVERTE:    { bg: "rgba(26,158,111,0.1)",  color: "#1A9E6F", label: "Ouverte"     },
  EN_ATTENTE: { bg: "rgba(238,129,61,0.1)",  color: "#EE813D", label: "En attente"  },
  FERMEE:     { bg: "rgba(214,64,69,0.1)",   color: "#D64045", label: "Fermée"      },
};

export default function EntrepriseOffresPage() {
  const { id } = useParams<{ id: string }>();
  const entrepriseId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId,  setEditingId]  = useState<number | null>(null);

  const { data: offres = [], isLoading } = useQuery({
    queryKey: ["admin-offres", entrepriseId],
    queryFn:  () => adminApi.getOffresByEntreprise(entrepriseId).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (offreId: number) => adminApi.deleteOffre(offreId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-offres", entrepriseId] });
      toast.success("Offre supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const statutMut = useMutation({
    mutationFn: ({ offreId, statut }: { offreId: number; statut: string }) =>
      adminApi.updateOffreStatut(offreId, statut),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-offres", entrepriseId] });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  const entrepriseName = offres[0]?.entreprise?.nom ?? `Entreprise #${entrepriseId}`;

  return (
    <AppShell pageTitle="Offres entreprise">
      <style>{`
        .offre-card {
          background: white;
          border: 1px solid rgba(16,64,107,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: box-shadow 0.2s;
          margin-bottom: 12px;
        }
        .offre-card:hover { box-shadow: 0 4px 20px rgba(16,64,107,0.08); }
        .offre-header {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px; cursor: pointer;
        }
        .offre-body { padding: 0 20px 20px; border-top: 1px solid rgba(16,64,107,0.07); }
        .statut-badge {
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 99px;
          white-space: nowrap;
        }
        .action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: none; cursor: pointer; flex-shrink: 0;
          transition: background 0.15s;
        }
        .tag {
          display: inline-block; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 8px;
          background: rgba(16,64,107,0.06); color: #5A7A96;
        }
      `}</style>

      {/* Back + title */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#5A7A96", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", marginBottom: 16, padding: 0 }}
        >
          <ArrowLeft size={15} /> Retour
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#EE813D", marginBottom: 6 }}>
              Entreprise
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em" }}>
              {entrepriseName}
            </h1>
            <p style={{ color: "#5A7A96", fontSize: 14, marginTop: 4 }}>
              {isLoading ? "..." : `${offres.length} offre${offres.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement...</span>
        </div>
      ) : offres.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#B0C4D4" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Aucune offre pour cette entreprise</div>
        </div>
      ) : (
        offres.map((offre: Offre) => {
          const s = STATUT_COLORS[offre.statut] ?? STATUT_COLORS.EN_ATTENTE;
          const isExpanded = expandedId === offre.id;
          const isEditing  = editingId  === offre.id;

          return (
            <div key={offre.id} className="offre-card">
              {/* Header row — always visible */}
              <div
                className="offre-header"
                onClick={() => {
                  setExpandedId(isExpanded ? null : offre.id);
                  if (isEditing) setEditingId(null);
                }}
              >
                {/* Statut dot */}
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#0D2137" }}>
                      {offre.titre}
                    </span>
                    <span className="statut-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                    <span className="tag">{offre.type_contrat}</span>
                    {offre.localisation && <span className="tag">📍 {offre.localisation}</span>}
                    <span className="tag">👥 {offre._count?.candidatures ?? 0} candidature{offre._count?.candidatures !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  {/* Approve */}
                  {offre.statut === "EN_ATTENTE" && (
                    <button
                      className="action-btn"
                      title="Approuver"
                      style={{ background: "rgba(26,158,111,0.1)" }}
                      onClick={() => statutMut.mutate({ offreId: offre.id, statut: "OUVERTE" })}
                    >
                      <Check size={14} color="#1A9E6F" />
                    </button>
                  )}
                  {/* Close */}
                  {offre.statut === "OUVERTE" && (
                    <button
                      className="action-btn"
                      title="Fermer"
                      style={{ background: "rgba(214,64,69,0.08)" }}
                      onClick={() => statutMut.mutate({ offreId: offre.id, statut: "FERMEE" })}
                    >
                      <X size={14} color="#D64045" />
                    </button>
                  )}
                  {/* Edit */}
                  <button
                    className="action-btn"
                    title="Modifier"
                    style={{ background: isEditing ? "rgba(34,132,192,0.15)" : "rgba(34,132,192,0.08)" }}
                    onClick={() => {
                      setEditingId(isEditing ? null : offre.id);
                      setExpandedId(offre.id);
                    }}
                  >
                    <Pencil size={13} color="#2284C0" />
                  </button>
                  {/* Delete */}
                  <button
                    className="action-btn"
                    title="Supprimer"
                    style={{ background: "rgba(214,64,69,0.08)" }}
                    onClick={() => {
                      if (confirm(`Supprimer "${offre.titre}" ?`)) deleteMut.mutate(offre.id);
                    }}
                  >
                    <Trash2 size={13} color="#D64045" />
                  </button>
                </div>

                {/* Chevron */}
                <div style={{ color: "#B0C4D4", flexShrink: 0 }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div className="offre-body">
                  {isEditing ? (
                    <OffreEditPanel
                      offre={offre}
                      entrepriseId={entrepriseId}
                      onDone={() => {
                        setEditingId(null);
                        qc.invalidateQueries({ queryKey: ["admin-offres", entrepriseId] });
                      }}
                    />
                  ) : (
                    <div style={{ paddingTop: 16 }}>
                      {/* Description */}
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 8 }}>Description</div>
                      <p style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.75, marginBottom: 16, whiteSpace: "pre-wrap" }}>{offre.description}</p>

                      {/* Competences */}
                      {offre.competences && offre.competences.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 8 }}>Compétences</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {offre.competences.map((c: any) => (
                              <span key={c.competence.id} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99, background: "rgba(34,132,192,0.08)", color: "#2284C0" }}>
                                {c.competence.nom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                        {[
                          { label: "Contrat",    value: offre.type_contrat },
                          { label: "Niveau",     value: offre.niveau_experience ?? "—" },
                          { label: "Lieu",       value: offre.localisation ?? "—" },
                          { label: "Salaire", value: offre.salaire_min ? `${offre.salaire_min.toLocaleString()} – ${offre.salaire_max?.toLocaleString() ?? "?"} MAD` : "—" },
                          { label: "Candidatures", value: String(offre._count?.candidatures ?? 0) },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ background: "#F7F8FA", borderRadius: 10, padding: "10px 14px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#B0C4D4", marginBottom: 3 }}>{label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0D2137" }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setEditingId(offre.id)}
                        style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10406B,#2284C0)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                      >
                        <Pencil size={13} /> Modifier cette offre
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </AppShell>
  );
}