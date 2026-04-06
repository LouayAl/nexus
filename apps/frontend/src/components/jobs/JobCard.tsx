// apps/frontend/src/components/jobs/JobCard.tsx
"use client";

import { useState } from "react";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { type Offre } from "@/lib/api";
import { theme, CONTRACT_COLORS } from "@/lib/theme";
import { Badge, Button } from "@/components/ui";

const JOB_EMOJIS: Record<string, string> = {
  "React":     "⚡",
  "Data":      "📊",
  "Design":    "🎨",
  "Java":      "🏦",
  "DevOps":    "☁️",
  "Product":   "🚀",
  "Marketing": "📣",
  "ML":        "🤖",
};

export function JobCard({ offre, canApply = true }: {
  offre:      Offre;
  canApply?:  boolean;
}) {
  const [hov, setHov] = useState(false);

  const emoji =
    Object.entries(JOB_EMOJIS).find(([k]) => offre.titre.includes(k))?.[1] ?? "💼";
  const contractColor =
    (CONTRACT_COLORS[offre.type_contrat] ?? "neutral") as "success" | "warning" | "secondary" | "primary" | "neutral";
  const salaire =
    offre.salaire_min && offre.salaire_max
      ? `${offre.salaire_min / 1000}K–${offre.salaire_max / 1000}K  MAD/an`
      : null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="glass-card"
      style={{
        padding: 22, cursor: "pointer",
        transition: "all 0.25s ease",
        transform:   hov ? "translateY(-3px)" : "translateY(0)",
        borderColor: hov ? theme.cardBorderHover : theme.cardBorder,
        boxShadow:   hov ? "0 16px 48px rgba(82,146,255,0.08)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: `${theme.primary}15`, border: `1px solid ${theme.primary}25`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>
          {emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
            <div className="font-syne" style={{ fontWeight: 700, fontSize: 15, color: theme.text, lineHeight: 1.3 }}>
              {offre.titre}
            </div>
            <Badge variant={contractColor}>{offre.type_contrat}</Badge>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", gap: 12, color: theme.textSub, fontSize: 12, marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Building2 size={11} /> {offre.entreprise.nom}
            </span>
            {offre.localisation && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={11} /> {offre.localisation}
              </span>
            )}
          </div>

          {/* Skills */}
          {offre.competences && offre.competences.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
              {offre.competences.slice(0, 5).map((c) => (
                <span key={c.competence.id} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: theme.textSub,
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 6,
                }}>
                  {c.competence.nom}
                </span>
              ))}
            </div>
          )}

          {/* Salary + CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {salaire
              ? <div style={{ color: theme.accent, fontWeight: 700, fontSize: 13 }}>{salaire}</div>
              : <div />
            }
            {canApply && (
              <Button
                variant={hov ? "primary" : "secondary"}
                size="sm"
                icon={hov ? <ArrowRight size={12} /> : undefined}
              >
                Postuler
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}