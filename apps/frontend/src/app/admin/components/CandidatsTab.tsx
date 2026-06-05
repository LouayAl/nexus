"use client";

import { useState, useEffect  } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Briefcase, Star, FileText, ChevronRight, ShieldCheck } from "lucide-react";
import { adminApi, type CandidatAdmin } from "@/lib/api";
import { CandidatDetailModal } from "./CandidatDetailModal";
import { CandidatFilters } from "./CandidatFilters";
import { Pagination } from "./Pagination";
import { resolveAvatarUrl } from "@/lib/avatar";

type FilterState = {
  search:       string;
  localisation: string;
  competence:   string;
  qualifie:     "" | "true" | "false";
};

const EMPTY_FILTERS: FilterState = {
  search: "", localisation: "", competence: "", qualifie: "",
};

export function CandidatsTab() {

  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<number | null>(null);
  const [page,     setPage]     = useState(1);
  const [filters,  setFilters]  = useState<FilterState>(EMPTY_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400); // wait 400ms after last keystroke
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFiltersChange = (f: FilterState) => {
    setFilters(f);
    setPage(1); // reset to page 1 on filter change
  };

  const { data, isLoading } = useQuery({
    queryKey:  ["admin-candidats", page, debouncedFilters],
    queryFn:   () => adminApi.getAllCandidats({
      page,
      limit: 24,
      search:       debouncedFilters.search       || undefined,
      localisation: debouncedFilters.localisation || undefined,
      competence:   debouncedFilters.competence   || undefined,
      qualifie:     debouncedFilters.qualifie     || undefined,
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const candidats  = data?.data       ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      {selected !== null && (
        <CandidatDetailModal candidatId={selected} onClose={() => setSelected(null)}/>
      )}

      <CandidatFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
        total={total}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }}/>
          <span style={{ color: "#5A7A96" }}>Chargement…</span>
        </div>
      ) : candidats.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#10406B", marginBottom: 8 }}>Aucun candidat trouvé</div>
          <div style={{ color: "#5A7A96", fontSize: 14 }}>Essayez de modifier vos filtres</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px,100%), 1fr))", gap: 14 }}>
            {candidats.map(c => (
              <CandidatCard key={c.id} candidat={c} onClick={() => setSelected(c.id)}/>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={24}
            onChange={setPage}
          />
        </>
      )}
    </>
  );
}

function CandidatCard({ candidat: c, onClick }: { candidat: CandidatAdmin; onClick: () => void }) {
  const initials       = `${c.prenom.charAt(0)}${c.nom.charAt(0)}`.toUpperCase();
  const nbCandidatures = c._count?.candidatures ?? 0;
  const nbCompetences  = c._count?.competences  ?? 0;
  const qualifie       = c.adminNote?.qualifie ?? false;
  const avatarSrc      = resolveAvatarUrl(c.avatarUrl);

  const gradients = [
    "linear-gradient(135deg,#10406B,#2284C0)",
    "linear-gradient(135deg,#1A9E6F,#0d7a54)",
    "linear-gradient(135deg,#7C3AED,#5B21B6)",
    "linear-gradient(135deg,#EE813D,#c86120)",
    "linear-gradient(135deg,#D64045,#a82030)",
  ];
  const gradient = gradients[c.prenom.charCodeAt(0) % gradients.length];

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: qualifie
          ? "2px solid #1A9E6F"
          : "1px solid rgba(16,64,107,0.09)",
        borderRadius: 18,
        padding: qualifie ? "17px 15px" : "18px 16px", // compensate for thicker border
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: qualifie
          ? "0 4px 20px rgba(26,158,111,0.18), 0 0 0 4px rgba(26,158,111,0.06)"
          : "0 2px 8px rgba(16,64,107,0.06)",
        position: "relative",
      }}
      onMouseEnter={ev => {
        const el = ev.currentTarget as HTMLElement;
        el.style.transform = "translateY(-3px)";
        el.style.boxShadow = qualifie
          ? "0 10px 32px rgba(26,158,111,0.22), 0 0 0 4px rgba(26,158,111,0.08)"
          : "0 10px 28px rgba(16,64,107,0.12)";
        if (!qualifie) el.style.borderColor = "rgba(34,132,192,0.25)";
      }}
      onMouseLeave={ev => {
        const el = ev.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = qualifie
          ? "0 4px 20px rgba(26,158,111,0.18), 0 0 0 4px rgba(26,158,111,0.06)"
          : "0 2px 8px rgba(16,64,107,0.06)";
        if (!qualifie) el.style.borderColor = "rgba(16,64,107,0.09)";
      }}
    >
      {/* Qualified badge */}
      {qualifie && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 99,
          background: "rgba(26,158,111,0.1)",
          border: "1px solid rgba(26,158,111,0.25)",
          color: "#1A9E6F", fontSize: 10, fontWeight: 700,
        }}>
          <ShieldCheck size={10}/> Qualifié
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        {avatarSrc ? (
          <img
            src={avatarSrc} alt="avatar"
            style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "white", fontFamily: "'Fraunces',serif" }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0D2137", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.prenom} {c.nom}
          </div>
          {c.titre && (
            <div style={{ fontSize: 11, color: "#2284C0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.titre}</div>
          )}
        </div>
        <ChevronRight size={15} color="#B0C4D4" style={{ flexShrink: 0 }}/>
      </div>

      {/* Location */}
      {c.localisation && (
        <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <MapPin size={10}/>{c.localisation}
        </div>
      )}

      {/* Email */}
      <div style={{ fontSize: 11, color: "#B0C4D4", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {c.utilisateur?.email}
      </div>

      {/* Skills chips */}
      {(c.competences?.length ?? 0) > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {c.competences!.slice(0, 4).map(comp => (
            <span key={comp.competenceId} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", color: "#5A7A96" }}>
              {comp.competence.nom}
            </span>
          ))}
          {(c.competences?.length ?? 0) > 4 && (
            <span style={{ fontSize: 10, color: "#B0C4D4", padding: "2px 4px" }}>+{c.competences!.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", gap: 12, paddingTop: 10, borderTop: `1px solid ${qualifie ? "rgba(26,158,111,0.12)" : "rgba(16,64,107,0.06)"}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
          <Briefcase size={10}/>
          <span style={{ fontWeight: 700, color: "#10406B" }}>{nbCandidatures}</span>
          {" "}candidature{nbCandidatures !== 1 ? "s" : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#5A7A96" }}>
          <Star size={10}/>
          <span style={{ fontWeight: 700, color: "#1A9E6F" }}>{nbCompetences}</span>
          {" "}compétence{nbCompetences !== 1 ? "s" : ""}
        </div>
        {c.cvUrl && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#2284C0", fontWeight: 600 }}>
            <FileText size={10}/> CV
          </div>
        )}
      </div>
    </div>
  );
}