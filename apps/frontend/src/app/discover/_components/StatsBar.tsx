"use client";

import { useEffect, useState } from "react";
import { Briefcase, Building2, Users, TrendingUp } from "lucide-react";

const STATS = [
  { value: "12 000+", label: "Offres actives",    Icon: Briefcase  },
  { value: "3 400+",  label: "Entreprises",        Icon: Building2  },
  { value: "98 000+", label: "Candidats inscrits", Icon: Users      },
  { value: "89%",     label: "Taux de placement",  Icon: TrendingUp },
];

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

export function StatsBar() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <section style={{ background: "white", borderBottom: "1px solid rgba(16,64,107,0.08)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {STATS.map((stat, i) => {
              const borderRight  = i % 2 === 0 ? "1px solid rgba(16,64,107,0.08)" : "none";
              const borderBottom = i < 2       ? "1px solid rgba(16,64,107,0.08)" : "none";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "20px 16px",
                    borderRight,
                    borderBottom,
                    justifyContent: "flex-start",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(34,132,192,0.1), rgba(16,64,107,0.08))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(34,132,192,0.1)",
                  }}>
                    <stat.Icon size={17} color="#2284C0" />
                  </div>
                  <div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: 20, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em",
                        background: "linear-gradient(135deg, #10406B, #2284C0)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#5A7A96", marginTop: 3, fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: "white", borderBottom: "1px solid rgba(16,64,107,0.08)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px", display: "flex" }}>
        {STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1, display: "flex", alignItems: "center", gap: 18,
              padding: "32px 40px",
              borderRight: i < STATS.length - 1 ? "1px solid rgba(16,64,107,0.08)" : "none",
              justifyContent: "center", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,132,192,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(34,132,192,0.1), rgba(16,64,107,0.08))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(34,132,192,0.1)",
            }}>
              <stat.Icon size={22} color="#2284C0" />
            </div>
            <div>
              <div
                className="font-display"
                style={{
                  fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em",
                  background: "linear-gradient(135deg, #10406B, #2284C0)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: "#5A7A96", marginTop: 5, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}