"use client";

import { resolveAvatarUrl } from "@/lib/avatar";
import type { EntreprisePublic } from "@/lib/api";
import { useRef, useState, useEffect } from "react";

export function CompanyCarousel({ entreprises }: { entreprises: EntreprisePublic[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scrollPosRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const autoScrollVelocityRef = useRef<number>(-1.5);
  const isDraggingRef = useRef<boolean>(false);

  // Animation loop - direct ref updates, no state
  const animate = () => {
    let newPos = scrollPosRef.current;

    if (isDraggingRef.current) {
      // During drag, velocity is controlled by mouse movement
      newPos += velocityRef.current;
    } else {
      // When not dragging, apply either momentum or auto-scroll
      if (Math.abs(velocityRef.current) > 0.5) {
        // Momentum scrolling is active
        newPos += velocityRef.current;
        velocityRef.current *= 0.93;
      } else {
        // Auto-scroll
        newPos += autoScrollVelocityRef.current;
      }
    }

    scrollPosRef.current = newPos;
    
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${newPos}px)`;
    }

    requestAnimationFrame(animate);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastXRef.current;
    velocityRef.current = deltaX;
    lastXRef.current = e.clientX;
    
    scrollPosRef.current += deltaX;
    
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${scrollPosRef.current}px)`;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove as any);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove as any);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Start animation loop once on mount
  useEffect(() => {
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section style={{
      background: "linear-gradient(180deg, #FAFAF8 0%, white 100%)",
      padding: "72px 0 80px",
      borderTop: "1px solid rgba(16,64,107,0.07)",
      overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: 52, padding: "0 64px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5A7A96", marginBottom: 10 }}>
          Ils nous font confiance
        </div>
        <h2 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: "#10406B", letterSpacing: "-0.02em" }}>
          Entreprises partenaires
        </h2>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          overflow: "hidden", 
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 140, background: "linear-gradient(90deg, white, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 140, background: "linear-gradient(-90deg, white, transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div 
          ref={trackRef}
          style={{
            display: "flex",
            willChange: "transform",
          }}
        >
          {[...Array(3)].map((_, setIndex) =>
            entreprises.map((co, i) => {
              const logoSrc = resolveAvatarUrl(co.logoUrl);
              return (
                <div
                  key={`${setIndex}-${i}`}
                  className="carousel-card"
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    gap: 18,
                    padding: "20px 44px",
                    borderRight: "1px solid rgba(16,64,107,0.06)",
                    borderRadius: 20,
                    flexShrink: 0, 
                    cursor: "pointer",
                    background: "#F7F8FA",
                    transition: "background 0.2s",
                    userSelect: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#DAF4FF")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#F7F8FA")}
                >
                  {/* Logo or initial */}
                  <div style={{
                    width: 90, 
                    height: 56, 
                    borderRadius: 12, 
                    flexShrink: 0,
                    background: logoSrc ? "white" : "linear-gradient(135deg, #10406B, #2284C0)",
                    border: logoSrc ? "1px solid rgba(16,64,107,0.1)" : "none",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 20, 
                    fontWeight: 800, 
                    color: "white",
                    fontFamily: "'Fraunces',serif",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(16,64,107,0.1)",
                  }}>
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={co.nom}
                        draggable={false}
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "contain", 
                          padding: 4,
                          pointerEvents: "none",
                        }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      co.nom.charAt(0)
                    )}
                  </div>

                  {/* Name + sector */}
                  <div style={{ pointerEvents: "none" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0D2137", whiteSpace: "nowrap" }}>
                      {co.nom}
                    </div>
                    {co.secteur && (
                      <div style={{ fontSize: 12, color: "#5A7A96", marginTop: 2, whiteSpace: "nowrap" }}>
                        {co.secteur}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}