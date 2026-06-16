// frontend/src/app/admin/components/EntrepriseDetailModal.tsx
"use client";

import { useState } from "react";
import { MapPin, Users, ChevronRight, ChevronLeft, Trash2, Archive, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { adminApi, type EntrepriseAdmin, type Offre } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function EntrepriseDetailModal({
  entreprise,
  onClose,
}: {
  entreprise: EntrepriseAdmin;
  onClose: () => void;
}) {
  const [view, setView] = useState<"profile" | "offres">("profile");
  const qc = useQueryClient();

  const ouvertes = entreprise.offres.filter((o) => o.statut === "OUVERTE").length;
  const total = entreprise.offres.reduce((s, o) => s + o._count.candidatures, 0);

  const { data: offres = [], isLoading: loadingOffres } = useQuery({
    queryKey: ["admin-entreprise-offres", entreprise.id],
    queryFn: () => adminApi.getOffresByEntreprise(entreprise.id).then((r) => r.data),
    enabled: view === "offres",
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      adminApi.updateOffreStatut(id, statut),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-entreprise-offres", entreprise.id] });
      qc.invalidateQueries({ queryKey: ["admin-entreprises"] });
      toast.success("Statut mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  const deleteOffre = useMutation({
    mutationFn: (id: number) => adminApi.deleteOffre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-entreprise-offres", entreprise.id] });
      qc.invalidateQueries({ queryKey: ["admin-entreprises"] });
      toast.success("Offre supprimée");
    },
    onError: () => toast.error("Erreur"),
  });

  const STATUT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
    OUVERTE:     { color: "#1A9E6F", bg: "rgba(26,158,111,0.1)",  label: "Ouverte"     },
    EN_ATTENTE:  { color: "#EE813D", bg: "rgba(238,129,61,0.1)",  label: "En attente"  },
    FERMEE:      { color: "#D64045", bg: "rgba(214,64,69,0.1)",   label: "Fermée"      },
  };
  const router = useRouter();
  
  return (
    <Modal title={view === "profile" ? "Profil entreprise" : `Offres — ${entreprise.nom}`} onClose={onClose}>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: "#F7F8FA", borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {(["profile", "offres"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "9px", borderRadius: 9, border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            background: view === v ? "white" : "transparent",
            color: view === v ? "#10406B" : "#5A7A96",
            boxShadow: view === v ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
            transition: "all 0.18s",
          }}>
            {v === "profile" ? "Profil" : `Offres (${entreprise._count.offres})`}
          </button>
        ))}
      </div>

      {view === "profile" && (
        <>
          {/* Header */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "linear-gradient(135deg, #10406B, #2284C0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 900, color: "white", flexShrink: 0,
            }}>
              {entreprise.nom.charAt(0)}
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: "#0D2137", marginBottom: 4 }}>
                {entreprise.nom}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {entreprise.secteur && <span style={{ fontSize: 12, color: "#2284C0", fontWeight: 600 }}>{entreprise.secteur}</span>}
                {entreprise.localisation && (
                  <span style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={10} />{entreprise.localisation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total offres",  value: entreprise._count.offres, color: "#2284C0" },
              { label: "Ouvertes",      value: ouvertes,                 color: "#1A9E6F" },
              { label: "Candidatures",  value: total,                    color: "#EE813D" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(16,64,107,0.07)", textAlign: "center", cursor: s.label === "Total offres" ? "pointer" : "default" }}
                onClick={() => s.label === "Total offres" && setView("offres")}
              >
                <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#5A7A96", marginTop: 3 }}>{s.label}</div>
                {s.label === "Total offres" && (
                  <div style={{ fontSize: 10, color: "#2284C0", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    Voir les offres <ChevronRight size={10} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info */}
          <div style={{ background: "#F7F8FA", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
            {[
              { label: "Email",        value: entreprise.utilisateur.email },
              { label: "Secteur",      value: entreprise.secteur ?? "—" },
              { label: "Localisation", value: entreprise.localisation ?? "—" },
              { label: "Site web",     value: entreprise.siteWeb ?? "—" },
              { label: "Membre depuis",value: new Date(entreprise.utilisateur.createdAt).toLocaleDateString("fr-FR") },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(16,64,107,0.05)" }}>
                <span style={{ fontSize: 12, color: "#5A7A96" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0D2137" }}>{value}</span>
              </div>
            ))}
          </div>

          {entreprise.description && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.7, margin: 0 }}>{entreprise.description}</p>
            </div>
          )}
        </>
      )}

      {view === "offres" && (
        <>
          <button onClick={() => setView("profile")} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "#5A7A96", fontSize: 13, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", marginBottom: 16, padding: 0,
          }}>
            <ChevronLeft size={14} /> Retour au profil
          </button>

          {loadingOffres ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : offres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#5A7A96", fontSize: 14 }}>
              Aucune offre pour cette entreprise.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {offres.map((o: Offre) => {
                const sc = STATUT_STYLE[o.statut] ?? STATUT_STYLE.FERMEE;
                return (
                  <div key={o.id} style={{
                    background: "#F7F8FA", borderRadius: 14,
                    border: "1px solid rgba(16,64,107,0.07)",
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0D2137", marginBottom: 6 }}>{o.titre}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                            {sc.label}
                          </span>
                          <span style={{ fontSize: 11, color: "#5A7A96", display: "flex", alignItems: "center", gap: 3 }}>
                            <Users size={10} /> {o._count?.candidatures ?? 0} candidature(s)
                          </span>
                          <span style={{ fontSize: 11, color: "#B0C4D4" }}>
                            {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        {o.statut !== "OUVERTE" && (
                          <button
                            onClick={() => updateStatut.mutate({ id: o.id, statut: "OUVERTE" })}
                            disabled={updateStatut.isPending}
                            title="Ouvrir"
                            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(26,158,111,0.1)", color: "#1A9E6F", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {o.statut !== "FERMEE" && (
                          <button
                            onClick={() => updateStatut.mutate({ id: o.id, statut: "FERMEE" })}
                            disabled={updateStatut.isPending}
                            title="Archiver"
                            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(238,129,61,0.1)", color: "#EE813D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Archive size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer "${o.titre}" ?`)) deleteOffre.mutate(o.id);
                          }}
                          disabled={deleteOffre.isPending}
                          title="Supprimer"
                          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(214,64,69,0.08)", color: "#D64045", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}