// frontend/src/app/admin/entreprises/page.tsx
"use client";

import { useState } from "react";
import { ArrowLeft, Search, Building2, MapPin, Briefcase, Users, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAdminEntreprises } from "../_hooks/useAdminData";
import { EntrepriseDetailModal } from "../components/EntrepriseDetailModal";
import { type EntrepriseAdmin } from "@/lib/api";
import Link from "next/link";

const SECTEURS = ["Tous", "Tech", "Finance", "Santé", "Education", "Commerce", "Industrie", "Autre"];

export default function AdminEntreprisesPage() {
  const { data: entreprises = [], isLoading } = useAdminEntreprises(true);
  const [search,    setSearch]    = useState("");
  const [secteur,   setSecteur]   = useState("Tous");
  const [selected,  setSelected]  = useState<EntrepriseAdmin | null>(null);

  const filtered = entreprises.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.nom.toLowerCase().includes(q) || e.localisation?.toLowerCase().includes(q) || e.utilisateur.email.toLowerCase().includes(q);
    const matchSecteur = secteur === "Tous" || e.secteur?.toLowerCase().includes(secteur.toLowerCase());
    return matchSearch && matchSecteur;
  });

  const selSx: React.CSSProperties = {
    padding: "9px 14px", borderRadius: 10,
    border: "1.5px solid rgba(16,64,107,0.12)", outline: "none",
    fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif",
    background: "white", cursor: "pointer",
  };

  return (
    <AppShell pageTitle="Entreprises">
      <style>{`
        .ent-card { background:white; border:1px solid rgba(16,64,107,0.08); border-radius:18px; padding:20px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(16,64,107,0.05); }
        .ent-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(16,64,107,0.12); border-color:rgba(34,132,192,0.25); }
        .ent-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(280px,100%),1fr)); gap:14px; }
      `}</style>

      {selected && <EntrepriseDetailModal entreprise={selected} onClose={() => setSelected(null)} />}

      {/* Back + title */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5A7A96", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}>
          <ArrowLeft size={15} /> Tableau de bord
        </Link>
        <h1 className="font-display" style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Entreprises
        </h1>
        <p style={{ color: "#5A7A96", fontSize: 14 }}>{isLoading ? "…" : `${filtered.length} entreprise${filtered.length !== 1 ? "s" : ""}`}</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            style={{ ...selSx, width: "100%", paddingLeft: 36, boxSizing: "border-box" }} />
        </div>
        <select value={secteur} onChange={e => setSecteur(e.target.value)} style={selSx}>
          {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#10406B" }}>Aucune entreprise trouvée</div>
        </div>
      ) : (
        <div className="ent-grid">
          {filtered.map(e => {
            const ouvertes = e.offres.filter(o => o.statut === "OUVERTE").length;
            const totalC   = e.offres.reduce((s, o) => s + o._count.candidatures, 0);
            return (
              <div key={e.id} className="ent-card" onClick={() => setSelected(e)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg,#10406B,#2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "white" }}>
                    {e.nom.charAt(0)}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link
                      href={`/admin/entreprises/${e.id}/offres`}
                      onClick={ev => ev.stopPropagation()}
                      title="Voir les offres"
                      style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(34,132,192,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                    >
                      <ExternalLink size={13} color="#2284C0" />
                    </Link>
                    <ChevronRight size={15} color="#B0C4D4" style={{ marginTop: 7 }} />
                  </div>
                </div>

                <div className="font-display" style={{ fontSize: 15, fontWeight: 800, color: "#0D2137", marginBottom: 2 }}>{e.nom}</div>
                {e.secteur && <div style={{ fontSize: 12, color: "#2284C0", fontWeight: 600, marginBottom: 4 }}>{e.secteur}</div>}
                {e.localisation && (
                  <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <MapPin size={10} />{e.localisation}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#B0C4D4", marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.utilisateur.email}</div>

                <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(16,64,107,0.06)", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
                    <Briefcase size={10} /><span style={{ fontWeight: 700, color: "#10406B" }}>{e._count.offres}</span> offre{e._count.offres !== 1 ? "s" : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
                    <Users size={10} /><span style={{ fontWeight: 700, color: "#EE813D" }}>{totalC}</span> candidature{totalC !== 1 ? "s" : ""}
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
      )}
    </AppShell>
  );
}