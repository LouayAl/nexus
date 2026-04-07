// frontend/src/app/admin/components/OffresTab.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle, XCircle, Building2, MapPin, Clock, Eye, Loader2, Users,
} from "lucide-react";
import { adminApi, type Offre } from "@/lib/api";
import toast from "react-hot-toast";

export function OffresTab({
  pending,
  loading,
}: {
  pending: Offre[];
  loading: boolean;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);

  const approve = useMutation({
    mutationFn: (id: number) => adminApi.approveOffre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      toast.success("Offre approuvée !");
    },
    onError: () => toast.error("Erreur"),
  });

  const reject = useMutation({
    mutationFn: (id: number) => adminApi.rejectOffre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      toast.success("Offre refusée.");
    },
    onError: () => toast.error("Erreur"),
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
        <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "#5A7A96" }}>Chargement…</span>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#10406B", marginBottom: 8 }}>Tout est à jour !</div>
        <div style={{ color: "#5A7A96", fontSize: 14 }}>Aucune offre en attente de validation.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 14 }}>
        Offres en attente de validation ({pending.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pending.map((offer: Offre) => (
          <div
            key={offer.id}
            style={{
              background: "white", borderRadius: 16,
              border: "1px solid rgba(16,64,107,0.08)",
              boxShadow: "0 2px 8px rgba(16,64,107,0.05)", overflow: "hidden",
            }}
          >
            <div style={{ height: 3, background: "linear-gradient(90deg, #EE813D, #2284C0)" }} />
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#0D2137" }}>{offer.titre}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "rgba(238,129,61,0.1)", color: "#EE813D" }}>⏳ En attente</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, color: "#5A7A96", fontSize: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={11} />{offer.entreprise?.nom}</span>
                    {offer.localisation && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{offer.localisation}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{new Date(offer.createdAt).toLocaleDateString("fr-FR")}</span>
                    <span>{offer.type_contrat}</span>
                    {offer.niveau_experience && <span>{offer.niveau_experience}</span>}
                  </div>
                  {(offer.competences?.length ?? 0) > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {offer.competences!.map((c) => (
                        <span
                          key={c.competenceId}
                          style={{ background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", color: "#5A7A96", fontSize: 11, padding: "3px 10px", borderRadius: 8 }}
                        >
                          {c.competence.nom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => reject.mutate(offer.id)}
                      disabled={reject.isPending}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "rgba(214,64,69,0.06)", border: "1px solid rgba(214,64,69,0.2)", color: "#D64045", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                    >
                      <XCircle size={15} /> Refuser
                    </button>
                    <button
                      onClick={() => approve.mutate(offer.id)}
                      disabled={approve.isPending}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg, #1A9E6F, #0d7a54)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 12px rgba(26,158,111,0.3)" }}
                    >
                      <CheckCircle size={15} /> Approuver
                    </button>
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === offer.id ? null : offer.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#5A7A96", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                  >
                    <Eye size={13} /> {expanded === offer.id ? "Masquer" : "Aperçu"}
                  </button>
                </div>
              </div>

              {expanded === offer.id && (
                <div style={{ marginTop: 16, padding: "14px 16px", background: "#F7F8FA", borderRadius: 10, fontSize: 13, color: "#5A7A96", lineHeight: 1.7, borderLeft: "3px solid #2284C0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#B0C4D4", marginBottom: 6 }}>Description</div>
                  {offer.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}