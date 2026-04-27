// frontend/src/app/admin/components/Entreprisestab.tsx
"use client";

import { useState } from "react";
import { Loader2, MapPin, Briefcase, Users, ChevronRight, Search } from "lucide-react";
import { type EntrepriseAdmin } from "@/lib/api";

export function EntreprisesTab({ entreprises, loading, onSelect }: {
  entreprises: EntrepriseAdmin[];
  loading:     boolean;
  onSelect:    (e: EntrepriseAdmin) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = entreprises.filter(e => {
    const q = search.toLowerCase();
    return !q || e.nom.toLowerCase().includes(q) || e.secteur?.toLowerCase().includes(q) || e.localisation?.toLowerCase().includes(q);
  });

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12 }}>
      <Loader2 size={24} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
      <span style={{ color:"#5A7A96" }}>Chargement…</span>
    </div>
  );

  return (
    <>
      {/* Search */}
      <div style={{ position:"relative", marginBottom:20, maxWidth:400 }}>
        <Search size={14} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une entreprise…"
          style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid rgba(16,64,107,0.12)", borderRadius:12, fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"white", outline:"none", boxSizing:"border-box" }}
          onFocus={e  => (e.target.style.borderColor="#2284C0")}
          onBlur={e   => (e.target.style.borderColor="rgba(16,64,107,0.12)")}
        />
      </div>

      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>
        Entreprises ({filtered.length})
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(260px,100%), 1fr))", gap:14 }}>
        {filtered.map(e => {
          const ouvertes = e.offres.filter(o => o.statut==="OUVERTE").length;
          const totalC   = e.offres.reduce((s, o) => s + o._count.candidatures, 0);
          return (
            <div key={e.id} onClick={() => onSelect(e)} style={{ background:"white", border:"1px solid rgba(16,64,107,0.09)", borderRadius:18, padding:"18px 16px", cursor:"pointer", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(16,64,107,0.06)" }}
              onMouseEnter={ev => { const el = ev.currentTarget as HTMLElement; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 10px 28px rgba(16,64,107,0.12)"; el.style.borderColor="rgba(34,132,192,0.25)"; }}
              onMouseLeave={ev => { const el = ev.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 8px rgba(16,64,107,0.06)"; el.style.borderColor="rgba(16,64,107,0.09)"; }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#10406B,#2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif" }}>
                  {e.nom.charAt(0)}
                </div>
                <ChevronRight size={15} color="#B0C4D4"/>
              </div>
              <div className="font-display" style={{ fontSize:15, fontWeight:800, color:"#0D2137", marginBottom:3 }}>{e.nom}</div>
              {e.secteur && <div style={{ fontSize:12, color:"#2284C0", fontWeight:600, marginBottom:3 }}>{e.secteur}</div>}
              {e.localisation && (
                <div style={{ fontSize:12, color:"#5A7A96", display:"flex", alignItems:"center", gap:4, marginBottom:10 }}>
                  <MapPin size={10}/>{e.localisation}
                </div>
              )}
              <div style={{ display:"flex", gap:10, paddingTop:10, borderTop:"1px solid rgba(16,64,107,0.06)", flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
                  <Briefcase size={10}/><span style={{ fontWeight:700, color:"#10406B" }}>{e._count.offres}</span> offre{e._count.offres!==1?"s":""}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
                  <Users size={10}/><span style={{ fontWeight:700, color:"#EE813D" }}>{totalC}</span> candidat{totalC!==1?"s":""}
                </div>
                {ouvertes > 0 && (
                  <div style={{ marginLeft:"auto", background:"rgba(26,158,111,0.1)", color:"#1A9E6F", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>
                    {ouvertes} ouverte{ouvertes!==1?"s":""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}