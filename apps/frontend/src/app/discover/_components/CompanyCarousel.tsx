// apps/frontend/src/app/discover/_components/CompanyCarousel.tsx
"use client";

import { Globe, Zap } from "lucide-react";
import type { EntreprisePublic } from "@/lib/api";

export function CompanyCarousel({ entreprises }: { entreprises: EntreprisePublic[] }) {
  return (
    <section style={{ background:"linear-gradient(180deg, #FAFAF8 0%, white 100%)", padding:"56px 0 64px", borderTop:"1px solid rgba(16,64,107,0.07)", overflow:"hidden" }}>
      <div style={{ textAlign:"center", marginBottom:40, padding:"0 64px" }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#5A7A96", marginBottom:10 }}>Ils nous font confiance</div>
        <h2 className="font-display" style={{ fontSize:28, fontWeight:800, color:"#10406B", letterSpacing:"-0.02em" }}>Entreprises partenaires</h2>
      </div>

      <div style={{ overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:120, background:"linear-gradient(90deg, white, transparent)", zIndex:2, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:120, background:"linear-gradient(-90deg, white, transparent)", zIndex:2, pointerEvents:"none" }}/>

        <div className="carousel-track">
          {[...Array(3)].map((_, setIndex) =>
            entreprises.map((co, i) => (
              <div key={`${setIndex}-${i}`} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"16px 36px", borderRight:"1px solid rgba(16,64,107,0.06)",
                flexShrink:0, cursor:"pointer", background:"#F7F8FA", transition:"background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background="rgba(16,64,107,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background="#F7F8FA")}
              >
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:"rgba(34,132,192,0.1)", border:"1px solid rgba(34,132,192,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#2284C0", fontFamily:"'Fraunces',serif" }}>
                  {co.nom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0D2137", whiteSpace:"nowrap" }}>{co.nom}</div>
                  <div style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:3, marginTop:1 }}>
                    <Globe size={10}/> {co._count.offres} offre{co._count.offres > 1 ? "s" : ""} actives
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ textAlign:"center", marginTop:48, padding:"0 64px" }}>
        <p style={{ color:"#5A7A96", fontSize:15, marginBottom:20 }}>
          Vous êtes une entreprise ? Publiez vos offres et trouvez les meilleurs talents.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button style={{ padding:"13px 28px", borderRadius:99, background:"linear-gradient(135deg, #EE813D, #d4691f)", border:"none", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 20px rgba(238,129,61,0.35)", display:"flex", alignItems:"center", gap:8 }}>
            <Zap size={15}/> Publier une offre
          </button>
          <button style={{ padding:"13px 28px", borderRadius:99, background:"white", border:"1px solid rgba(16,64,107,0.15)", color:"#10406B", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 2px 8px rgba(16,64,107,0.06)" }}>
            En savoir plus
          </button>
        </div>
      </div>
    </section>
  );
}