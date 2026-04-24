"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, User, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAppLanguage } from "@/hooks/useAppLanguage";

const COPY = {
  fr: {
    candidate: "Candidat",
    profile: "Mon profil",
    logout: "Déconnexion",
    account: "Compte",
  },
  en: {
    candidate: "Candidate",
    profile: "My profile",
    logout: "Log out",
    account: "Account",
  },
} as const;

export function TopNav({ pageTitle }: { pageTitle: string }) {
  const { user, logout } = useAuth();
  const { language } = useAppLanguage();
  const pathname = usePathname();
  const copy = COPY[language];

  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "NU";

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: 66,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(16,64,107,0.09)" : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
          boxShadow: scrolled ? "0 2px 20px rgba(16,64,107,0.07)" : "none",
        }}
      >
        <Link
          href={user?.role === "ADMIN" ? "/admin" : "/profile"}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <BrandLogo height={36} />
        </Link>

        <div style={{ flex: 1, minWidth: 0, padding: "0 16px" }} className="hide-mobile">
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#EE813D", marginBottom: 2 }}>
            {pageTitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <div ref={userMenuRef} className="hide-mobile" style={{ position: "relative" }}>
            <button
              onClick={() => setUserOpen((open) => !open)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 10px 5px 5px",
                borderRadius: 99,
                background: "transparent",
                border: "1px solid rgba(16,64,107,0.1)",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #EE813D, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email?.split("@")[0] ?? copy.account}
              </span>
            </button>

            {userOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 10px)", width: 220, borderRadius: 14, overflow: "hidden", zIndex: 200, background: "white", border: "1px solid rgba(16,64,107,0.1)", boxShadow: "0 12px 40px rgba(16,64,107,0.14)" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(16,64,107,0.07)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                  <div style={{ fontSize: 11, color: "#5A7A96", marginTop: 2 }}>{copy.candidate}</div>
                </div>
                <Link href={user?.role === "ADMIN" ? "/admin" : "/profile"} onClick={() => setUserOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", fontSize: 13, fontWeight: 500, color: "#0D2137", textDecoration: "none", borderBottom: "1px solid rgba(16,64,107,0.05)" }}>
                  <User size={13} color="#5A7A96" /> {copy.profile}
                </Link>
                <button onClick={() => { logout(); setUserOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#D64045", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  <LogOut size={14} /> {copy.logout}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="show-mobile-flex"
            style={{ width: 38, height: 38, borderRadius: 10, display: "none", alignItems: "center", justifyContent: "center", background: "rgba(16,64,107,0.05)", border: "none", cursor: "pointer" }}
          >
            {mobileOpen ? <X size={20} color="#10406B" /> : <Menu size={20} color="#10406B" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98, background: "rgba(13,33,55,0.3)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "fixed", top: 66, left: 0, right: 0, zIndex: 99, background: "white", borderBottom: "1px solid rgba(16,64,107,0.09)", boxShadow: "0 8px 32px rgba(16,64,107,0.12)", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#F7F8FA", borderRadius: 14, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #EE813D, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: "#5A7A96" }}>{copy.candidate}</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(16,64,107,0.07)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <Link href={user?.role === "ADMIN" ? "/admin" : "/profile"} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#0D2137", textDecoration: "none" }}>
                <User size={15} color="#5A7A96" /> {copy.profile}
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#D64045", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", width: "100%", textAlign: "left" }}>
                <LogOut size={15} /> {copy.logout}
              </button>
            </div>
          </div>
        </>
      )}

      {userOpen && <div onClick={() => setUserOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </>
  );
}
