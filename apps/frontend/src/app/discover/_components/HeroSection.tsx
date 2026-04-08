"use client";

import { Search, MapPin, Briefcase } from "lucide-react";

interface Props {
  keyword:    string;
  location:   string;
  total:      number;
  onKeyword:  (v: string) => void;
  onLocation: (v: string) => void;
  onSearch:   () => void;
  onTag:      (tag: string) => void;
}

const TRENDING = ["React","Python","Remote","DevOps","Product Manager","Data"];

export function HeroSection({ keyword, location, total, onKeyword, onLocation, onSearch, onTag }: Props) {
  return (
    <section style={{ position:"relative", overflow:"hidden", minHeight:"min(520px, 80vw)" }}>
      <img
        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80&auto=format&fit=crop"
        alt="People working"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }}
      />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg, rgba(16,64,107,0.92) 0%, rgba(16,64,107,0.75) 50%, rgba(34,132,192,0.4) 100%)" }}/>

      <div style={{ position:"relative", zIndex:1, maxWidth:1400, margin:"0 auto", padding:"clamp(40px,8vw,80px) var(--page-px) clamp(48px,8vw,90px)", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>

        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)", borderRadius:99, padding:"6px 18px", marginBottom:28, border:"1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#EE813D", display:"inline-block", flexShrink:0 }}/>
          <span style={{ fontSize:"clamp(11px,2.5vw,13px)", fontWeight:600, color:"rgba(255,255,255,0.9)", letterSpacing:"0.03em" }}>
            {total > 0 ? `${total} offres disponibles` : "Offres disponibles · Mis à jour en temps réel"}
          </span>
        </div>

        <h1 className="font-display hero-title" style={{ fontWeight:900, color:"white", lineHeight:1.1, marginBottom:18, letterSpacing:"-0.025em", maxWidth:720 }}>
          Votre prochain emploi<br/>
          <span style={{ color:"#EE813D", fontStyle:"italic" }}>vous attend.</span>
        </h1>

        <p style={{ fontSize:"clamp(14px,2.5vw,17px)", color:"rgba(255,255,255,0.65)", lineHeight:1.75, marginBottom:44, maxWidth:500 }}>
          Connectez talent et opportunité. Des milliers d'offres sélectionnées pour votre prochaine grande étape.
        </p>

        {/* Search box — stacks on mobile */}
        <div style={{ background:"white", borderRadius:18, padding:"clamp(6px,2vw,8px)", display:"flex", flexDirection:"column" as any, width:"100%", maxWidth:920, boxShadow:"0 24px 64px rgba(0,0,0,0.25)", gap:0 }}
          className="search-box"
        >
          <style>{`
            @media (min-width: 640px) {
              .search-box { flex-direction: row !important; }
              .search-divider { display: block !important; }
            }
          `}</style>

          {/* Keyword */}
          <div style={{ flex:2, display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:"1px solid rgba(16,64,107,0.1)" }} className="search-field-1">
            <style>{`
              @media (min-width: 640px) {
                .search-field-1 { border-bottom: none !important; border-right: 1px solid rgba(16,64,107,0.1) !important; }
              }
            `}</style>
            <Briefcase size={20} color="#2284C0" style={{ flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#5A7A96", marginBottom:2 }}>Poste ou compétence</div>
              <input value={keyword} onChange={e => onKeyword(e.target.value)} onKeyDown={e => e.key==="Enter" && onSearch()}
                placeholder="Ex : Développeur React…"
                style={{ border:"none", outline:"none", width:"100%", fontSize:14, fontWeight:500, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"none", padding:"4px 0" }}
              />
            </div>
          </div>

          {/* Location */}
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:"1px solid rgba(16,64,107,0.1)" }} className="search-field-2">
            <style>{`
              @media (min-width: 640px) {
                .search-field-2 { border-bottom: none !important; }
              }
            `}</style>
            <MapPin size={20} color="#EE813D" style={{ flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#5A7A96", marginBottom:2 }}>Localisation</div>
              <input value={location} onChange={e => onLocation(e.target.value)} onKeyDown={e => e.key==="Enter" && onSearch()}
                placeholder="Paris, Remote, Lyon…"
                style={{ border:"none", outline:"none", width:"100%", fontSize:14, fontWeight:500, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"none", padding:"4px 0" }}
              />
            </div>
          </div>

          <button onClick={onSearch} style={{
            background:"linear-gradient(135deg, #EE813D, #d4691f)", border:"none", borderRadius:12,
            padding:"14px 32px", color:"white", fontSize:15, fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 16px rgba(238,129,61,0.4)",
            margin:"clamp(6px,2vw,8px)",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity="0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity="1")}
          >
            <Search size={16}/> Rechercher
          </button>
        </div>

        {/* Trending tags */}
        <div style={{ display:"flex", gap:8, marginTop:20, flexWrap:"wrap", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>Tendances :</span>
          {TRENDING.map(tag => (
            <button key={tag} onClick={() => onTag(tag)} style={{
              padding:"5px 14px", borderRadius:99,
              background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)",
              color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:500,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.1)")}
            >{tag}</button>
          ))}
        </div>
      </div>
    </section>
  );
}