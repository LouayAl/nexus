"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search, Briefcase, Star, FileText, ChevronRight, Filter } from "lucide-react";
import { adminApi, type CandidatAdmin } from "@/lib/api";
import { CandidatDetailModal } from "./CandidatDetailModal";

export function CandidatsTab() {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const { data: candidats = [], isLoading } = useQuery({
    queryKey: ["admin-candidats"],
    queryFn:  () => adminApi.getAllCandidats().then(r => r.data),
    // Keep data for 2 minutes — fast tab switching
    staleTime: 2 * 60_000,
  });

  const filtered = candidats.filter(c => {
    const q = search.toLowerCase();
    return !q
      || `${c.prenom} ${c.nom}`.toLowerCase().includes(q)
      || c.titre?.toLowerCase().includes(q)
      || c.localisation?.toLowerCase().includes(q)
      || c.utilisateur?.email?.toLowerCase().includes(q);
  });

  return (
    <>
      {selected !== null && (
        <CandidatDetailModal candidatId={selected} onClose={() => setSelected(null)}/>
      )}

      {/* Search */}
      <div style={{ position:"relative", marginBottom:20, maxWidth:400 }}>
        <Search size={14} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un candidat…"
          style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid rgba(16,64,107,0.12)", borderRadius:12, fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"white", outline:"none", boxSizing:"border-box" }}
          onFocus={e  => (e.target.style.borderColor="#2284C0")}
          onBlur={e   => (e.target.style.borderColor="rgba(16,64,107,0.12)")}
        />
      </div>

      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>
        Tous les candidats ({filtered.length})
      </div>

      {isLoading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
          <span style={{ color:"#5A7A96" }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", background:"white", borderRadius:20, border:"1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
          <div className="font-display" style={{ fontSize:20, fontWeight:700, color:"#10406B", marginBottom:8 }}>Aucun résultat</div>
          <div style={{ color:"#5A7A96", fontSize:14 }}>Essayez un autre terme.</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(260px,100%), 1fr))", gap:14 }}>
          {filtered.map(c => <CandidatCard key={c.id} candidat={c} onClick={() => setSelected(c.id)}/>)}
        </div>
      )}
    </>
  );
}

function CandidatCard({ candidat: c, onClick }: { candidat: CandidatAdmin; onClick: () => void }) {
  const initials      = `${c.prenom.charAt(0)}${c.nom.charAt(0)}`.toUpperCase();
  const nbCandidatures = c._count?.candidatures ?? 0;
  const nbCompetences  = c._count?.competences  ?? 0;

  const gradients = [
    "linear-gradient(135deg,#10406B,#2284C0)",
    "linear-gradient(135deg,#1A9E6F,#0d7a54)",
    "linear-gradient(135deg,#7C3AED,#5B21B6)",
    "linear-gradient(135deg,#EE813D,#c86120)",
    "linear-gradient(135deg,#D64045,#a82030)",
  ];
  const gradient = gradients[c.prenom.charCodeAt(0) % gradients.length];

  return (
    <div onClick={onClick}
      style={{ background:"white", border:"1px solid rgba(16,64,107,0.09)", borderRadius:18, padding:"18px 16px", cursor:"pointer", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(16,64,107,0.06)" }}
      onMouseEnter={ev => { const el = ev.currentTarget as HTMLElement; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 10px 28px rgba(16,64,107,0.12)"; el.style.borderColor="rgba(34,132,192,0.25)"; }}
      onMouseLeave={ev => { const el = ev.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 8px rgba(16,64,107,0.06)"; el.style.borderColor="rgba(16,64,107,0.09)"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {c.avatarUrl ? (
            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api","") ?? "http://localhost:3001"}${c.avatarUrl}`}
              alt="avatar" style={{ width:44, height:44, borderRadius:12, objectFit:"cover", flexShrink:0 }}
              onError={e => { (e.target as HTMLImageElement).style.display="none"; }}
            />
          ) : (
            <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif" }}>
              {initials}
            </div>
          )}
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0D2137", marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {c.prenom} {c.nom}
            </div>
            {c.titre && <div style={{ fontSize:11, color:"#2284C0", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.titre}</div>}
          </div>
        </div>
        <ChevronRight size={15} color="#B0C4D4" style={{ flexShrink:0 }}/>
      </div>

      {c.localisation && (
        <div style={{ fontSize:12, color:"#5A7A96", display:"flex", alignItems:"center", gap:4, marginBottom:10 }}>
          <MapPin size={10}/>{c.localisation}
        </div>
      )}

      {(c.competences?.length ?? 0) > 0 && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
          {c.competences!.slice(0,4).map(comp => (
            <span key={comp.competenceId} style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", color:"#5A7A96" }}>
              {comp.competence.nom}
            </span>
          ))}
          {(c.competences?.length ?? 0) > 4 && (
            <span style={{ fontSize:10, color:"#B0C4D4", padding:"2px 4px" }}>+{c.competences!.length - 4}</span>
          )}
        </div>
      )}

      <div style={{ display:"flex", gap:12, paddingTop:10, borderTop:"1px solid rgba(16,64,107,0.06)", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
          <Briefcase size={10}/><span style={{ fontWeight:700, color:"#10406B" }}>{nbCandidatures}</span> candidature{nbCandidatures!==1?"s":""}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
          <Star size={10}/><span style={{ fontWeight:700, color:"#1A9E6F" }}>{nbCompetences}</span> compétence{nbCompetences!==1?"s":""}
        </div>
        {c.cvUrl && (
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#2284C0", fontWeight:600 }}>
            <FileText size={10}/> CV
          </div>
        )}
      </div>
    </div>
  );
}