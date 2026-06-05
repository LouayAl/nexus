"use client";

import { Search, X, ShieldCheck } from "lucide-react";

interface FilterState {
  search:      string;
  localisation:string;
  competence:  string;
  qualifie:    "" | "true" | "false";
}

interface CandidatFiltersProps {
  filters:   FilterState;
  onChange:  (f: FilterState) => void;
  onReset:   () => void;
  total:     number;
  isLoading: boolean;
}

const iSx: React.CSSProperties = {
  width: "100%", padding: "9px 12px 9px 34px",
  borderRadius: 10, border: "1.5px solid rgba(16,64,107,0.12)",
  outline: "none", fontSize: 13, color: "#0D2137",
  fontFamily: "'DM Sans',sans-serif", background: "#FAFAF8",
  boxSizing: "border-box",
};

const selSx: React.CSSProperties = {
  padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid rgba(16,64,107,0.12)",
  outline: "none", fontSize: 13, color: "#0D2137",
  fontFamily: "'DM Sans',sans-serif", background: "#FAFAF8",
  cursor: "pointer",
};

export function CandidatFilters({ filters, onChange, onReset, total, isLoading }: CandidatFiltersProps) {
  const set = (key: keyof FilterState) => (val: string) =>
    onChange({ ...filters, [key]: val });

  const hasFilters = filters.search || filters.localisation || filters.competence || filters.qualifie;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>

      {/* Row 1: search + qualifié toggle */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={13} color="#B0C4D4" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}/>
          <input
            value={filters.search}
            onChange={e => set("search")(e.target.value)}
            placeholder="Nom, prénom, email, titre…"
            style={iSx}
            onFocus={e  => (e.target.style.borderColor = "#2284C0")}
            onBlur={e   => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
          />
        </div>

        {/* Localisation */}
        <div style={{ position: "relative", minWidth: 160 }}>
          <input
            value={filters.localisation}
            onChange={e => set("localisation")(e.target.value)}
            placeholder="Ville / région…"
            style={{ ...iSx, paddingLeft: 12 }}
            onFocus={e  => (e.target.style.borderColor = "#2284C0")}
            onBlur={e   => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
          />
        </div>

        {/* Compétence */}
        <div style={{ position: "relative", minWidth: 160 }}>
          <input
            value={filters.competence}
            onChange={e => set("competence")(e.target.value)}
            placeholder="Compétence…"
            style={{ ...iSx, paddingLeft: 12 }}
            onFocus={e  => (e.target.style.borderColor = "#2284C0")}
            onBlur={e   => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
          />
        </div>

        {/* Qualifié filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["", "true", "false"] as const).map(v => {
            const active  = filters.qualifie === v;
            const label   = v === "" ? "Tous" : v === "true" ? "✓ Qualifiés" : "Non qualifiés";
            const color   = v === "true" ? "#1A9E6F" : v === "false" ? "#D64045" : "#5A7A96";
            return (
              <button
                key={v}
                onClick={() => set("qualifie")(v)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 12px", borderRadius: 10, fontSize: 12,
                  fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  border: `1.5px solid ${active ? color : "rgba(16,64,107,0.12)"}`,
                  background: active ? `${color}12` : "#FAFAF8",
                  color: active ? color : "#5A7A96",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {v === "true" && <ShieldCheck size={12}/>}
                {label}
              </button>
            );
          })}
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={onReset}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 10, background: "rgba(214,64,69,0.06)", border: "1px solid rgba(214,64,69,0.15)", color: "#D64045", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}
          >
            <X size={12}/> Réinitialiser
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ fontSize: 12, color: "#5A7A96", fontWeight: 500 }}>
        {isLoading
          ? "Chargement…"
          : <><span style={{ color: "#10406B", fontWeight: 700 }}>{total}</span> candidat{total !== 1 ? "s" : ""} trouvé{total !== 1 ? "s" : ""}</>
        }
      </div>
    </div>
  );
}