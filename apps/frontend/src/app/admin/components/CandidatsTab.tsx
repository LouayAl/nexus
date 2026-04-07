// frontend/src/app/admin/components/CandidatsTab.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, MapPin, Search, Users, Briefcase,
  ChevronRight, FileText, Star,
} from "lucide-react";
import { adminApi, type CandidatAdmin } from "@/lib/api";
import { CandidatDetailModal } from "./CandidatDetailModal";

export function CandidatsTab() {
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const { data: candidats = [], isLoading } = useQuery({
    queryKey: ["admin-candidats"],
    queryFn: () => adminApi.getAllCandidats().then((r) => r.data),
  });

  const filtered = candidats.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${c.prenom} ${c.nom}`.toLowerCase().includes(q) ||
      c.titre?.toLowerCase().includes(q) ||
      c.localisation?.toLowerCase().includes(q) ||
      c.utilisateur?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {selected !== null && (
        <CandidatDetailModal
          candidatId={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search
          size={15}
          color="#B0C4D4"
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un candidat…"
          style={{
            width: "100%", padding: "10px 14px 10px 38px",
            border: "1.5px solid rgba(16,64,107,0.12)", borderRadius: 12,
            fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif",
            background: "white", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 14 }}>
        Tous les candidats ({filtered.length})
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#10406B", marginBottom: 8 }}>Aucun résultat</div>
          <div style={{ color: "#5A7A96", fontSize: 14 }}>Essayez un autre terme de recherche.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
          {filtered.map((c) => (
            <CandidatCard
              key={c.id}
              candidat={c}
              onClick={() => setSelected(c.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CandidatCard({
  candidat: c,
  onClick,
}: {
  candidat: CandidatAdmin;
  onClick: () => void;
}) {
  const initials = `${c.prenom.charAt(0)}${c.nom.charAt(0)}`.toUpperCase();
  const nbCandidatures = c._count?.candidatures ?? 0;
  const nbCompetences  = c._count?.competences  ?? 0;

  // Pick a gradient per first letter
  const gradients = [
    "linear-gradient(135deg, #10406B, #2284C0)",
    "linear-gradient(135deg, #1A9E6F, #0d7a54)",
    "linear-gradient(135deg, #7C3AED, #5B21B6)",
    "linear-gradient(135deg, #EE813D, #c86120)",
    "linear-gradient(135deg, #D64045, #a82030)",
  ];
  const gradient = gradients[c.prenom.charCodeAt(0) % gradients.length];

  return (
    <div
      onClick={onClick}
      style={{
        background: "white", border: "1px solid rgba(16,64,107,0.09)",
        borderRadius: 20, padding: "20px", cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: "0 2px 8px rgba(16,64,107,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(16,64,107,0.13)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,132,192,0.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(16,64,107,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,64,107,0.09)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "white", fontFamily: "'Fraunces',serif",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0D2137", marginBottom: 2 }}>
              {c.prenom} {c.nom}
            </div>
            {c.titre && (
              <div style={{ fontSize: 12, color: "#2284C0", fontWeight: 500 }}>{c.titre}</div>
            )}
          </div>
        </div>
        <ChevronRight size={16} color="#B0C4D4" style={{ flexShrink: 0 }} />
      </div>

      {/* Location */}
      {c.localisation && (
        <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <MapPin size={10} />{c.localisation}
        </div>
      )}

      {/* Competences preview */}
      {(c.competences?.length ?? 0) > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {c.competences!.slice(0, 4).map((comp) => (
            <span
              key={comp.competenceId}
              style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", color: "#5A7A96" }}
            >
              {comp.competence.nom}
            </span>
          ))}
          {(c.competences?.length ?? 0) > 4 && (
            <span style={{ fontSize: 10, color: "#B0C4D4", padding: "3px 4px" }}>+{c.competences!.length - 4}</span>
          )}
        </div>
      )}

      {/* Stats footer */}
      <div style={{ display: "flex", gap: 14, paddingTop: 12, borderTop: "1px solid rgba(16,64,107,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
          <Briefcase size={11} />
          <span style={{ fontWeight: 700, color: "#10406B" }}>{nbCandidatures}</span>
          <span>candidature{nbCandidatures !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
          <Star size={11} />
          <span style={{ fontWeight: 700, color: "#1A9E6F" }}>{nbCompetences}</span>
          <span>compétence{nbCompetences !== 1 ? "s" : ""}</span>
        </div>
        {c.cvUrl && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#2284C0", fontWeight: 600 }}>
            <FileText size={11} /> CV
          </div>
        )}
      </div>
    </div>
  );
}