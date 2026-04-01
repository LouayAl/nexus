// apps/frontend/src/app/discover/_components/FeaturedSlider.tsx
"use client";

import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { JobCard } from "./JobCard";
import { CardSkeleton } from "./CardSkeleton";
import type { Offre } from "@/lib/api";

interface Props {
  offres:  Offre[];
  loading: boolean;
  onApply: (offre: Offre) => void;
  selectedId?: number | null; 
}

export function FeaturedSlider({ offres, loading, onApply }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left"|"right") =>
    sliderRef.current?.scrollBy({ left: dir==="left" ? -340 : 340, behavior:"smooth" });

  return (
    <section style={{ padding:"56px 0 48px", overflow:"visible" }}>
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 32px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <Star size={16} color="#EE813D" fill="#EE813D"/>
              <span style={{ fontSize:12, fontWeight:700, color:"#EE813D", textTransform:"uppercase", letterSpacing:"0.08em" }}>À la une</span>
            </div>
            <h2 className="font-display" style={{ fontSize:28, fontWeight:800, color:"#10406B", letterSpacing:"-0.02em" }}>Offres en vedette</h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[ChevronLeft, ChevronRight].map((Icon, i) => (
              <button key={i} onClick={() => scroll(i===0?"left":"right")} style={{
                width:42, height:42, borderRadius:"50%", background:"white",
                border:"1px solid rgba(16,64,107,0.12)", display:"flex", alignItems:"center",
                justifyContent:"center", cursor:"pointer", transition:"all 0.18s",
                boxShadow:"0 2px 8px rgba(16,64,107,0.06)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#10406B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; }}
              >
                <Icon size={18} color="#5A7A96"/>
              </button>
            ))}
          </div>
        </div>

        <div ref={sliderRef} className="scroll-row" style={{ gap:16, padding:"16px 4px 24px", overflowY:"visible" }}>
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ flexShrink:0, width:320 }}><CardSkeleton/></div>
              ))
            : offres.map(o => <JobCard key={o.id} offre={o} featured onApply={onApply}/>)
          }
        </div>
      </div>
    </section>
  );
}