// frontend/src/app/admin/candidats/page.tsx
"use client";

import { useState } from "react";
import { ArrowLeft, Search, MapPin, Briefcase, Star, FileText, ChevronRight, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAdminCandidats } from "../_hooks/useAdminData";
import { CandidatDetailModal } from "../components/CandidatDetailModal";
import { type CandidatAdmin } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/avatar";
import Link from "next/link";

export default function AdminCandidatsPage() {
  const { data: candidats = [], isLoading } = useAdminCandidats(true);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = candidats.filter(c => {
    const q = search.toLowerCase();
    return !q
      || `${c.prenom} ${c.nom}`.toLowerCase().includes(q)
      || c.titre?.toLowerCase().includes(q)
      || c.localisation?.toLowerCase().includes(q)
      || c.utilisateur?.email?.toLowerCase().includes(q);
  });

  const gradients = [
    "linear-gradient(135deg,#10406B,#2284C0)",
    "linear-gradient(135deg,#1A9E6F,#0d7a54)",
    "linear-gradient(135deg,#7C3AED,#5B21B6)",
    "linear-gradient(135deg,#EE813D,#c86120)",
    "linear-gradient(135deg,#D64045,#a82030)",
  ];

  return (
    <AppShell pageTitle="Candidats">
      <style>{`
        .cand-card { background:white; border:1px solid rgba(16,64,107,0.08); border-radius:18px; padding:20px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(16,64,107,0.05); }
        .cand-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(16,64,107,0.12); border-color:rgba(34,132,192,0.25); }
        .cand-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(280px,100%),1fr)); gap:14px; }
      `}</style>

      {selected !== null && <CandidatDetailModal candidatId={selected} onClose={() => setSelected(null)} />}

      {/* Back + title */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5A7A96", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}>
          <ArrowLeft size={15} /> Tableau de bord
        </Link>
        <h1 className="font-display" style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Candidats
        </h1>
        <p style={{ color: "#5A7A96", fontSize: 14 }}>{isLoading ? "…" : `${filtered.length} candidat${filtered.length !== 1 ? "s" : ""}`}</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 440 }}>
        <Search size={14} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un candidat…"
          style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid rgba(16,64,107,0.12)", borderRadius: 12, fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif", background: "white", outline: "none", boxSizing: "border-box" }}
          onFocus={e => (e.target.style.borderColor = "#2284C0")}
          onBlur={e  => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
        />
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#10406B" }}>Aucun candidat trouvé</div>
        </div>
      ) : (
        <div className="cand-grid">
          {filtered.map((c: CandidatAdmin) => {
            const initials  = `${c.prenom.charAt(0)}${c.nom.charAt(0)}`.toUpperCase();
            const nbCand    = c._count?.candidatures ?? 0;
            const nbComp    = c._count?.competences  ?? 0;
            const gradient  = gradients[c.prenom.charCodeAt(0) % gradients.length];
            const avatarSrc = resolveAvatarUrl(c.avatarUrl);

            return (
              <div key={c.id} className="cand-card" onClick={() => setSelected(c.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="avatar" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "white" }}>
                        {initials}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0D2137", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.prenom} {c.nom}</div>
                      {c.titre && <div style={{ fontSize: 11, color: "#2284C0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.titre}</div>}
                    </div>
                  </div>
                  <ChevronRight size={15} color="#B0C4D4" style={{ flexShrink: 0 }} />
                </div>

                {c.localisation && (
                  <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                    <MapPin size={10} />{c.localisation}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#B0C4D4", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.utilisateur?.email}</div>

                {(c.competences?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                    {c.competences!.slice(0, 4).map(comp => (
                      <span key={comp.competenceId} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", color: "#5A7A96" }}>
                        {comp.competence.nom}
                      </span>
                    ))}
                    {(c.competences?.length ?? 0) > 4 && <span style={{ fontSize: 10, color: "#B0C4D4", padding: "2px 4px" }}>+{c.competences!.length - 4}</span>}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, paddingTop: 10, borderTop: "1px solid rgba(16,64,107,0.06)", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
                    <Briefcase size={10} /><span style={{ fontWeight: 700, color: "#10406B" }}>{nbCand}</span> candidature{nbCand !== 1 ? "s" : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
                    <Star size={10} /><span style={{ fontWeight: 700, color: "#1A9E6F" }}>{nbComp}</span> compétence{nbComp !== 1 ? "s" : ""}
                  </div>
                  {c.cvUrl && (
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#2284C0", fontWeight: 600 }}>
                      <FileText size={10} /> CV
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