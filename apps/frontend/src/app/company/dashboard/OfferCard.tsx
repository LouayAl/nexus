// ═══════════════════════════════════════════════════════════════════════════════
// OFFER CARD
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { MapPin, Users, ChevronRight } from "lucide-react";
import { CONTRACT_COLORS, OFFRE_STATUT_CONFIG, getEmoji, type Offre } from "./constants";

interface OfferCardProps {
  offre: Offre;
  onClick: () => void;
}

export function OfferCard({ offre, onClick }: OfferCardProps) {
  const [hov, setHov] = useState(false);
  const contract = CONTRACT_COLORS[offre.type_contrat] ?? { bg: "rgba(16,64,107,0.08)", color: "#10406B" };
  const salary = offre.salaire_min && offre.salaire_max ? `${Math.round(offre.salaire_min / 1000)}K – ${Math.round(offre.salaire_max / 1000)}K  MAD` : null;
  const skills = offre.competences?.map(c => c.competence) ?? [];
  const statutConfig = OFFRE_STATUT_CONFIG[offre.statut] ?? OFFRE_STATUT_CONFIG.FERMEE;
  const candidateCount = offre._count?.candidatures ?? 0;

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#F7F8FA", border: `1px solid ${hov ? "rgba(34,132,192,0.25)" : "rgba(16,64,107,0.09)"}`, borderRadius: 20, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)", transform: hov ? "translateY(-3px)" : "translateY(0)", boxShadow: hov ? "0 16px 40px rgba(16,64,107,0.13)" : "0 2px 8px rgba(16,64,107,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: hov ? "linear-gradient(90deg, #EE813D, #2284C0)" : "transparent", transition: "background 0.3s", borderRadius: "20px 20px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, fontSize: 20, flexShrink: 0, background: `linear-gradient(135deg, ${contract.color}18, ${contract.color}30)`, border: `1px solid ${contract.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>{getEmoji(offre)}</div>
        <span style={{ background: statutConfig.bg, color: statutConfig.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.04em", textTransform: "uppercase" }}>{statutConfig.label}</span>
      </div>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}><span style={{ ...contract, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{offre.type_contrat}</span></div>
        <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#0D2137", marginBottom: 4, lineHeight: 1.3 }}>{offre.titre}</div>
        <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4 }}>{offre.localisation && <><MapPin size={10} /> {offre.localisation}</>}</div>
      </div>
      {skills.length > 0 && <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{skills.slice(0, 3).map(c => <span key={c.id} style={{ background: "#F0F4F8", color: "#5A7A96", fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6 }}>{c.nom}</span>)}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8, borderTop: "1px solid rgba(16,64,107,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5A7A96" }}><Users size={12} /> <span style={{ fontWeight: 700, color: "#10406B" }}>{candidateCount}</span> candidat{candidateCount !== 1 ? "s" : ""}</div>
        {salary && <div style={{ fontSize: 12, fontWeight: 700, color: "#10406B" }}>{salary}/an</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: hov ? "#2284C0" : "#B0C4D4", fontWeight: 600, transition: "color 0.2s" }}>Voir <ChevronRight size={12} /></div>
      </div>
      
    </div>
    
    
  );
  
}
