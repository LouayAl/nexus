// frontend/src/app/discover/_components/JobCard.tsx
"use client";

import { useState } from "react";
import { Building2, MapPin, Heart, ArrowRight, Globe } from "lucide-react";
import type { Offre } from "@/lib/api";

const CONTRACT_STYLES: Record<string, { bg: string; color: string }> = {
  CDI:       { bg: "rgba(26,158,111,0.1)",  color: "#1A9E6F" },
  CDD:       { bg: "rgba(238,129,61,0.12)", color: "#EE813D" },
  Freelance: { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED" },
  Stage:     { bg: "rgba(34,132,192,0.1)",  color: "#2284C0" },
  Alternance:{ bg: "rgba(16,64,107,0.1)",   color: "#10406B" },
  Intérim:   { bg: "rgba(238,129,61,0.1)",  color: "#EE813D" },
};

function getEmoji(offre: Offre) {
  const skills = offre.competences?.map((c) => c.competence.nom) ?? [];
  if (skills.some((s) => s.includes("React")))      return "⚛️";
  if (skills.some((s) => s.includes("Python")))     return "🐍";
  if (skills.some((s) => s.includes("Figma")))      return "🎨";
  if (skills.some((s) => s.includes("Kubernetes"))) return "☁️";
  if (skills.some((s) => s.includes("Java")))       return "☕";
  if (skills.some((s) => s.includes("Pentest")))    return "🔒";
  if (skills.some((s) => s.includes("SEO")))        return "📣";
  return "💼";
}

interface JobCardProps {
  offre:        Offre;
  featured?:    boolean;
  onApply?:     (offre: Offre) => void;
  selectedId?:  number | null;
  forceActive?: boolean;
}

export function JobCard({
  offre,
  featured    = false,
  onApply,
  selectedId,
  forceActive = false,
}: JobCardProps) {
  const [saved, setSaved] = useState(false);
  const [hov,   setHov]   = useState(false);

  const active     = hov || forceActive;
  const isSelected = selectedId === offre.id;

  const contract = CONTRACT_STYLES[offre.type_contrat] ?? { bg: "rgba(16,64,107,0.08)", color: "#10406B" };
  const skills   = offre.competences?.map((c) => c.competence) ?? [];

  // ── Salary: only render if the field is visible to candidates ──────────
  const salary =
    offre.salaire_visible !== false && offre.salaire_min && offre.salaire_max
      ? `${Math.round(offre.salaire_min / 1000)}K – ${Math.round(offre.salaire_max / 1000)}K MAD`
      : null;

  return (
    <div
      onClick={() => onApply?.(offre)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   isSelected ? "rgba(34,132,192,0.04)" : "#F7F8FA",
        border: `1.5px solid ${
          isSelected ? "#2284C0"
          : active    ? "rgba(34,132,192,0.25)"
          :             "rgba(16,64,107,0.09)"
        }`,
        borderRadius: 20,
        padding:      featured ? "28px 24px" : "22px 20px",
        flexShrink:   0,
        width:        "100%",
        display:      "flex", flexDirection: "column", gap: 14,
        cursor:       "pointer",
        transition:   "border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease",
        boxShadow:    isSelected ? "0 0 0 3px rgba(34,132,192,0.15)" : "none",
        position:     "relative", overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position:     "absolute", top: 0, left: 0, right: 0, height: 3,
        background:   isSelected
          ? "linear-gradient(90deg, #2284C0, #EE813D)"
          : active
          ? "linear-gradient(90deg, #EE813D, #2284C0)"
          : "transparent",
        transition:   "background 0.3s ease",
        borderRadius: "20px 20px 0 0",
      }} />

      {/* Icon row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, fontSize: 20, flexShrink: 0,
          background: `linear-gradient(135deg, ${contract.color}18, ${contract.color}30)`,
          border: `1px solid ${contract.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {getEmoji(offre)}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: saved ? "rgba(238,129,61,0.1)" : "rgba(16,64,107,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <Heart size={14} fill={saved ? "#EE813D" : "none"} color={saved ? "#EE813D" : "#5A7A96"} />
        </button>
      </div>

      {/* Title + meta */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ ...contract, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>
            {offre.type_contrat}
          </span>
          {featured && (
            <span style={{ background: "rgba(238,129,61,0.1)", color: "#EE813D", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
              ⭐ En vedette
            </span>
          )}
          {isSelected && (
            <span style={{ background: "rgba(34,132,192,0.1)", color: "#2284C0", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
              ✓ Sélectionné
            </span>
          )}
        </div>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#0D2137", marginBottom: 4, lineHeight: 1.3 }}>
          {offre.titre}
        </div>
        <div style={{ fontSize: 13, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <Building2 size={11} /> {offre.entreprise.nom}
          {offre.localisation && <><span>&nbsp;·&nbsp;</span><MapPin size={11} /> {offre.localisation}</>}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {skills.slice(0, 3).map((c) => (
            <span key={c.id} style={{
              background: "#F0F4F8", color: "#5A7A96",
              fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 8,
            }}>
              {c.nom}
            </span>
          ))}
        </div>
      )}

      {/* Languages (if any) */}
      {offre.langues && offre.langues.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Globe size={11} color="#B0C4D4" />
          {offre.langues.map((lang) => (
            <span key={lang} style={{
              fontSize: 11, fontWeight: 500, color: "#5A7A96",
              background: "rgba(16,64,107,0.05)",
              padding: "2px 8px", borderRadius: 6,
            }}>
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* Salary + CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        {/* Only render salary if salaire_visible !== false */}
        {salary
          ? <div style={{ fontSize: 14, fontWeight: 700, color: "#10406B" }}>{salary} / an</div>
          : <div />
        }
        <button
          onClick={(e) => { e.stopPropagation(); onApply?.(offre); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 99,
            background: isSelected
              ? "linear-gradient(135deg, #2284C0, #10406B)"
              : active
              ? "linear-gradient(135deg, #EE813D, #2284C0)"
              : "#F0F4F8",
            border: "none",
            color:  isSelected || active ? "white" : "#10406B",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all 0.25s", fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {isSelected ? "Voir le détail" : "Postuler"}
          {(active || isSelected) && <ArrowRight size={12} />}
        </button>
      </div>
    </div>
  );
}