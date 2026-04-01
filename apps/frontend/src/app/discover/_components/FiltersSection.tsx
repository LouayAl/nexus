// apps/frontend/src/app/discover/_components/FiltersSection.tsx
"use client";

import type { RefObject } from "react";
import { JobCard } from "./JobCard";
import { CardSkeleton } from "./CardSkeleton";
import type { Offre } from "@/lib/api";

const CATEGORIES = [
  { label:"Toutes",     icon:"✦",  filter: null          },
  { label:"Tech",       icon:"⚡", filter:"React"        },
  { label:"Data",       icon:"📊", filter:"Python"       },
  { label:"Design",     icon:"🎨", filter:"Figma"        },
  { label:"Management", icon:"🚀", filter:"Agile"        },
  { label:"Marketing",  icon:"📣", filter:"SEO"          },
  { label:"DevOps",     icon:"☁️", filter:"Kubernetes"   },
  { label:"Sécurité",   icon:"🔒", filter:"Pentest"      },
];

const CONTRACT_TYPES = [
  { label:"Tous",      value: null,       color:"#10406B" },
  { label:"CDI",       value:"CDI",       color:"#1A9E6F" },
  { label:"CDD",       value:"CDD",       color:"#EE813D" },
  { label:"Freelance", value:"Freelance", color:"#7C3AED" },
  { label:"Stage",     value:"Stage",     color:"#2284C0" },
];

interface Props {
  resultsRef:   RefObject<HTMLDivElement | null>;
  offres:       Offre[];
  total:        number;
  loading:      boolean;
  activeKw:     string | null;
  contractType: string | null;
  hasFilters:   boolean;
  selectedId?: number | null;
  search:       { keyword: string; location: string };
  onCategory:   (filter: string | null) => void;
  onContract:   (value: string | null) => void;
  onClear:      () => void;
  onApply:      (offre: Offre) => void;
}

export function FiltersSection({
  resultsRef, offres, total, loading,
  activeKw, contractType, hasFilters, search,
  onCategory, onContract, onClear, onApply,
}: Props) {
  const scrollToResults = () =>
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);

  return (
    <section ref={resultsRef} style={{ padding:"0 0 56px", scrollMarginTop:80 }}>
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 32px" }}>

        {/* Category pills */}
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
          {CATEGORIES.map(cat => {
            const active = activeKw === cat.filter && !search.keyword;
            return (
              <button key={cat.label} onClick={() => { onCategory(active ? null : cat.filter); scrollToResults(); }} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"9px 18px", borderRadius:99, fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                background: active ? "#10406B" : "white",
                color:      active ? "white"   : "#5A7A96",
                border:     `1px solid ${active ? "#10406B" : "rgba(16,64,107,0.12)"}`,
                boxShadow:  active ? "0 4px 16px rgba(16,64,107,0.2)" : "0 1px 4px rgba(16,64,107,0.05)",
              }}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Contract type pills */}
        <div style={{ display:"flex", gap:8, marginBottom:24, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:600, color:"#5A7A96", marginRight:4 }}>Contrat :</span>
          {CONTRACT_TYPES.map(ct => {
            const active = contractType === ct.value;
            return (
              <button key={ct.label} onClick={() => { onContract(ct.value); scrollToResults(); }} style={{
                padding:"6px 16px", borderRadius:99, fontSize:12, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                background: active ? ct.color : "transparent",
                color:      active ? "white"  : ct.color,
                border:     `1.5px solid ${ct.color}`,
                opacity:    active ? 1 : 0.7,
              }}>
                {ct.label}
              </button>
            );
          })}

          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
            {hasFilters && (
              <button onClick={onClear} style={{
                padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600,
                background:"rgba(214,64,69,0.08)", color:"#D64045",
                border:"1px solid rgba(214,64,69,0.2)", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", gap:5,
              }}>
                ✕ Réinitialiser les filtres
              </button>
            )}
            <div style={{ fontSize:13, color:"#5A7A96", fontWeight:500 }}>
              <span style={{ color:"#10406B", fontWeight:700 }}>{total}</span> offre{total>1?"s":""} trouvée{total>1?"s":""}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" }}>
            {Array(6).fill(0).map((_, i) => <CardSkeleton key={i}/>)}
          </div>
        ) : offres.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div className="font-display" style={{ fontSize:22, fontWeight:700, color:"#10406B", marginBottom:8 }}>Aucune offre trouvée</div>
            <div style={{ color:"#5A7A96", fontSize:14 }}>Essayez d'autres mots-clés ou ajoutez des offres depuis le dashboard entreprise</div>
          </div>
        ) : (
          <div className="stagger-children" style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" }}>
            {offres.map(o => (
              <div key={o.id} className="animate-fade-up">
                <JobCard offre={o} onApply={onApply}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}