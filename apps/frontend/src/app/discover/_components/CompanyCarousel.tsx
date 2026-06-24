"use client";

import { resolveAvatarUrl } from "@/lib/avatar";
import type { EntreprisePublic } from "@/lib/api";

export function CompanyCarousel({ entreprises }: { entreprises: EntreprisePublic[] }) {
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

      <div style={{ overflow: "hidden", position: "relative" }}>
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 140, background: "linear-gradient(90deg, white, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 140, background: "linear-gradient(-90deg, white, transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div className="carousel-track">
          {[...Array(3)].map((_, setIndex) =>
            entreprises.map((co, i) => {
              const logoSrc = resolveAvatarUrl(co.logoUrl);
              return (
                <div
                  key={`${setIndex}-${i}`}
                  className="carousel-card"
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "20px 44px",
                    borderRight: "1px solid rgba(16,64,107,0.06)",
                    borderRadius: 20,
                    flexShrink: 0, cursor: "pointer",
                    background: "#F7F8FA",
                    transition: "background 0.2s",
                    
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#DAF4FF")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#F7F8FA")}
                >
                  {/* Logo or initial */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 13, flexShrink: 0,
                    background: logoSrc ? "white" : "linear-gradient(135deg, #10406B, #2284C0)",
                    border: logoSrc ? "1px solid rgba(16,64,107,0.1)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: "white",
                    fontFamily: "'Fraunces',serif",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(16,64,107,0.1)",
                  }}>
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={co.nom}
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      co.nom.charAt(0)
                    )}
                  </div>

                  {/* Name + sector */}
                  <div>
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