// frontend/src/app/admin/components/Entreprisestab.tsx
"use client";

import { Loader2, MapPin, Briefcase, Users, ChevronRight } from "lucide-react";
import { type EntrepriseAdmin } from "@/lib/api";

export function EntreprisesTab({
  entreprises,
  loading,
  onSelect,
}: {
  entreprises: EntrepriseAdmin[];
  loading: boolean;
  onSelect: (e: EntrepriseAdmin) => void;
}) {
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
        <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "#5A7A96" }}>Chargement…</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 14 }}>
        Toutes les entreprises ({entreprises.length})
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {entreprises.map((e) => {
          const ouvertes = e.offres.filter((o) => o.statut === "OUVERTE").length;
          const totalC = e.offres.reduce((s, o) => s + o._count.candidatures, 0);
          return (
            <div
              key={e.id}
              onClick={() => onSelect(e)}
              style={{
                background: "white", border: "1px solid rgba(16,64,107,0.09)",
                borderRadius: 20, padding: "22px 20px", cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
                boxShadow: "0 2px 8px rgba(16,64,107,0.06)",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={(e2) => {
                (e2.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e2.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(16,64,107,0.13)";
                (e2.currentTarget as HTMLElement).style.borderColor = "rgba(34,132,192,0.25)";
              }}
              onMouseLeave={(e2) => {
                (e2.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e2.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(16,64,107,0.06)";
                (e2.currentTarget as HTMLElement).style.borderColor = "rgba(16,64,107,0.09)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg, #10406B, #2284C0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 900, color: "white", fontFamily: "'Fraunces',serif",
                  }}
                >
                  {e.nom.charAt(0)}
                </div>
                <ChevronRight size={16} color="#B0C4D4" />
              </div>

              <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "#0D2137", marginBottom: 4 }}>{e.nom}</div>
              {e.secteur && <div style={{ fontSize: 12, color: "#2284C0", fontWeight: 600, marginBottom: 4 }}>{e.secteur}</div>}
              {e.localisation && (
                <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                  <MapPin size={10} />{e.localisation}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(16,64,107,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
                  <Briefcase size={11} /><span style={{ fontWeight: 700, color: "#10406B" }}>{e._count.offres}</span> offre{e._count.offres !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
                  <Users size={11} /><span style={{ fontWeight: 700, color: "#EE813D" }}>{totalC}</span> candidat{totalC !== 1 ? "s" : ""}
                </div>
                {ouvertes > 0 && (
                  <div style={{ marginLeft: "auto", background: "rgba(26,158,111,0.1)", color: "#1A9E6F", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                    {ouvertes} ouverte{ouvertes !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}