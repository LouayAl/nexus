"use client";

import type { RefObject } from "react";
import { JobCard } from "./JobCard";
import { CardSkeleton } from "./CardSkeleton";
import type { Offre } from "@/lib/api";

const CATEGORIES = [
  { label: "Toutes",     icon: "✦",  filter: null          },
  { label: "Tech",       icon: "⚡", filter: "React"        },
  { label: "Data",       icon: "📊", filter: "Python"       },
  { label: "Design",     icon: "🎨", filter: "Figma"        },
  { label: "Management", icon: "🚀", filter: "Agile"        },
  { label: "Marketing",  icon: "📣", filter: "SEO"          },
  { label: "DevOps",     icon: "☁️", filter: "Kubernetes"   },
  { label: "Sécurité",   icon: "🔒", filter: "Pentest"      },
];

const CONTRACT_TYPES = [
  { label: "Tous",      value: null,        color: "#10406B" },
  { label: "CDI",       value: "CDI",       color: "#1A9E6F" },
  { label: "CDD",       value: "CDD",       color: "#EE813D" },
  { label: "Freelance", value: "Freelance", color: "#7C3AED" },
  { label: "Stage",     value: "Stage",     color: "#2284C0" },
];

interface Props {
  resultsRef:   RefObject<HTMLDivElement | null>;
  offres:       Offre[];
  total:        number;
  loading:      boolean;
  activeKw:     string | null;
  contractType: string | null;
  hasFilters:   boolean;
  search:       { keyword: string; location: string };
  onCategory:   (filter: string | null) => void;
  onContract:   (value: string | null) => void;
  onClear:      () => void;
  onApply:      (offre: Offre) => void;
  selectedId?:  number | null; // ← added: highlights the currently selected offer
}

export function FiltersSection({
  resultsRef, offres, total, loading,
  activeKw, contractType, hasFilters, search,
  onCategory, onContract, onClear, onApply, selectedId,
}: Props) {
  const scrollToResults = () =>
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

  return (
    <section ref={resultsRef} style={{ padding: "0 0 56px", scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 var(--page-px)" }}>

        {/* Category pills */}
        <div
          className="cat-pills"
          style={{
            display: "flex", gap: 8, marginBottom: 14,
            overflowX: "auto", paddingBottom: 4,
            scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          <style>{`.cat-pills::-webkit-scrollbar { display: none; }`}</style>
          {CATEGORIES.map((cat) => {
            const active = activeKw === cat.filter && !search.keyword;
            return (
              <button
                key={cat.label}
                onClick={() => { onCategory(active ? null : cat.filter); scrollToResults(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 16px", borderRadius: 99,
                  fontSize: "clamp(11px,2.5vw,13px)", fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
                  background: active ? "#10406B" : "white",
                  color:      active ? "white"   : "#5A7A96",
                  border:     `1px solid ${active ? "#10406B" : "rgba(16,64,107,0.12)"}`,
                  boxShadow:  active ? "0 4px 16px rgba(16,64,107,0.2)" : "0 1px 4px rgba(16,64,107,0.05)",
                  flexShrink: 0,
                }}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Contract + clear row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#5A7A96", marginRight: 4, flexShrink: 0 }}>
            Contrat :
          </span>
          {CONTRACT_TYPES.map((ct) => {
            const active = contractType === ct.value;
            return (
              <button
                key={ct.label}
                onClick={() => { onContract(ct.value); scrollToResults(); }}
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
                  background: active ? ct.color : "transparent",
                  color:      active ? "white"  : ct.color,
                  border:     `1.5px solid ${ct.color}`,
                  opacity:    active ? 1 : 0.7,
                  flexShrink: 0,
                }}
              >
                {ct.label}
              </button>
            );
          })}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {hasFilters && (
              <button
                onClick={onClear}
                style={{
                  padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: "rgba(214,64,69,0.08)", color: "#D64045",
                  border: "1px solid rgba(214,64,69,0.2)", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                ✕ Réinitialiser
              </button>
            )}
            <div style={{ fontSize: 13, color: "#5A7A96", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ color: "#10406B", fontWeight: 700 }}>{total}</span> offre{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}>
            {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : offres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div className="font-display" style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 700, color: "#10406B", marginBottom: 8 }}>
              Aucune offre trouvée
            </div>
            <div style={{ color: "#5A7A96", fontSize: 14 }}>Essayez d'autres mots-clés ou filtres</div>
          </div>
        ) : (
          <div
            className="stagger-children"
            style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))" }}
          >
            {offres.map((o) => (
              <div key={o.id} className="animate-fade-up">
                <JobCard offre={o} onApply={onApply} selectedId={selectedId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}