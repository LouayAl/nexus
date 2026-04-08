"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { JobCard } from "./JobCard";
import { CardSkeleton } from "./CardSkeleton";
import type { Offre } from "@/lib/api";

interface Props {
  offres:      Offre[];
  loading:     boolean;
  onApply:     (offre: Offre) => void;
  selectedId?: number | null;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const CARD_WIDTH = 280; // px — fixed width on mobile

export function FeaturedSlider({ offres, loading, onApply, selectedId }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const isMobile  = useIsMobile();
  const [activeIdx, setActiveIdx] = useState(0);

  // ── Center a specific card index ──────────────────────────────────────────
  const scrollTo = useCallback((idx: number) => {
    const el        = cardRefs.current[idx];
    const container = sliderRef.current;
    if (!el || !container) return;
    const offset = el.offsetLeft - (container.offsetWidth - CARD_WIDTH) / 2;
    container.scrollTo({ left: offset, behavior: "smooth" });
  }, []);

  // ── IntersectionObserver — mark the most-visible card as active ───────────
  useEffect(() => {
    if (!isMobile || !sliderRef.current || offres.length === 0) return;
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIdx(idx); },
        { root: sliderRef.current, threshold: 0.55 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [isMobile, offres]);

  // ── Arrow navigation ──────────────────────────────────────────────────────
  const goMobile = (dir: "left" | "right") => {
    const next = dir === "left"
      ? Math.max(0, activeIdx - 1)
      : Math.min(offres.length - 1, activeIdx + 1);
    setActiveIdx(next);
    scrollTo(next);
  };

  const goDesktop = (dir: "left" | "right") =>
    sliderRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });

  return (
    <section style={{ padding: isMobile ? "36px 0 28px" : "56px 0 48px", overflow: "visible" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "0" : "0 32px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: isMobile ? 20 : 28,
          padding: isMobile ? "0 20px" : "0",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Star size={isMobile ? 13 : 16} color="#EE813D" fill="#EE813D" />
              <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: "#EE813D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                À la une
              </span>
            </div>
            <h2 className="font-display" style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800, color: "#10406B", letterSpacing: "-0.02em" }}>
              Offres en vedette
            </h2>
          </div>

          {/* Desktop arrows */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 8 }}>
              {([ChevronLeft, ChevronRight] as const).map((Icon, i) => (
                <button
                  key={i}
                  onClick={() => goDesktop(i === 0 ? "left" : "right")}
                  style={{
                    width: 42, height: 42, borderRadius: "50%", background: "white",
                    border: "1px solid rgba(16,64,107,0.12)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.18s",
                    boxShadow: "0 2px 8px rgba(16,64,107,0.06)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#10406B"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white"; }}
                >
                  <Icon size={18} color="#5A7A96" />
                </button>
              ))}
            </div>
          )}

          {/* Mobile arrows */}
          {isMobile && !loading && offres.length > 1 && (
            <div style={{ display: "flex", gap: 6 }}>
              {([ChevronLeft, ChevronRight] as const).map((Icon, i) => {
                const disabled = i === 0 ? activeIdx === 0 : activeIdx === offres.length - 1;
                return (
                  <button
                    key={i}
                    onClick={() => goMobile(i === 0 ? "left" : "right")}
                    disabled={disabled}
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "white", border: "1px solid rgba(16,64,107,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: disabled ? "default" : "pointer",
                      opacity: disabled ? 0.3 : 1,
                      transition: "opacity 0.18s",
                      boxShadow: "0 1px 4px rgba(16,64,107,0.08)",
                    }}
                  >
                    <Icon size={15} color="#5A7A96" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Slider track ── */}
        <div
          ref={sliderRef}
          style={{
            display: "flex",
            gap: 16,
            padding: isMobile ? "16px 0 28px" : "16px 4px 24px",
            overflowX: "auto",
            overflowY: "visible",
            scrollbarWidth: "none",
            scrollSnapType: isMobile ? "x mandatory" : "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          <style>{`
            .featured-track::-webkit-scrollbar { display: none; }
          `}</style>

          {/* Left spacer — pulls first card to center */}
          {isMobile && (
            <div style={{ flexShrink: 0, width: `calc(50vw - ${CARD_WIDTH / 2}px)` }} />
          )}

          {loading
            ? Array(isMobile ? 3 : 4).fill(0).map((_, i) => (
                <div
                  key={i}
                  ref={el => { cardRefs.current[i] = el; }}
                  style={{ flexShrink: 0, width: isMobile ? CARD_WIDTH : 320, scrollSnapAlign: "center" }}
                >
                  <CardSkeleton />
                </div>
              ))
            : offres.map((o, idx) => {
                const isActive = isMobile && activeIdx === idx;
                return (
                  <div
                    key={o.id}
                    ref={el => { cardRefs.current[idx] = el; }}
                    style={{
                      flexShrink: 0,
                      width: isMobile ? CARD_WIDTH : 320,
                      scrollSnapAlign: isMobile ? "center" : "none",
                      // Active card pops forward; inactive cards recede
                      transform:  isActive ? "scale(1.04)" : isMobile ? "scale(0.93)" : "none",
                      opacity:    isMobile && !isActive ? 0.5 : 1,
                      transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
                    }}
                  >
                    {/* Shadow wrapper — elevated on active */}
                    <div style={{
                      borderRadius: 20,
                      boxShadow: isActive
                        ? "0 20px 56px rgba(16,64,107,0.2)"
                        : "0 2px 8px rgba(16,64,107,0.06)",
                      transition: "box-shadow 0.3s ease",
                    }}>
                      <JobCard
                        offre={o}
                        featured
                        onApply={onApply}
                        selectedId={selectedId}
                        forceActive={isActive}  // tells JobCard to render as if hovered
                      />
                    </div>
                  </div>
                );
              })
          }

          {/* Right spacer — pulls last card to center */}
          {isMobile && (
            <div style={{ flexShrink: 0, width: `calc(50vw - ${CARD_WIDTH / 2}px)` }} />
          )}
        </div>

        {/* ── Dot indicators ── */}
        {isMobile && !loading && offres.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 2 }}>
            {offres.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIdx(i); scrollTo(i); }}
                style={{
                  width:      i === activeIdx ? 20 : 6,
                  height:     6,
                  borderRadius: 99,
                  border:     "none", padding: 0,
                  background: i === activeIdx ? "#10406B" : "rgba(16,64,107,0.15)",
                  cursor:     "pointer",
                  transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}