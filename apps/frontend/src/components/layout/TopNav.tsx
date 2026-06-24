"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, User, X, Compass, FileText, Building2, Shield, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { notificationsApi } from "@/lib/api";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";

const COPY = {
  fr: {
    candidate: "Candidat",
    profile: "Mon profil",
    logout: "Déconnexion",
    account: "Compte",
    discover: "Découvrir",
    applications: "Candidatures",
    company: "Entreprise",
    admin: "Admin",
  },
  en: {
    candidate: "Candidate",
    profile: "My profile",
    logout: "Log out",
    account: "Account",
    discover: "Discover",
    applications: "Applications",
    company: "Company",
    admin: "Admin",
  },
} as const;

const NAV_ITEMS = [
  { href: "/discover",          labelKey: "discover" as const,     icon: Compass,   roles: ["CANDIDAT", "ENTREPRISE", "ADMIN"] },
  { href: "/applications",      labelKey: "applications" as const, icon: FileText,  roles: ["CANDIDAT"] },
  { href: "/company/dashboard", labelKey: "company" as const,      icon: Building2, roles: ["ENTREPRISE"] },
  { href: "/admin",             labelKey: "admin" as const,        icon: Shield,    roles: ["ADMIN"] },
  { href: "/profile",           labelKey: "profile" as const,      icon: User,      roles: ["CANDIDAT"] },
  { href: "/company/profile",   labelKey: "profile" as const,      icon: User,      roles: ["ENTREPRISE"] },
];

export function TopNav({ pageTitle }: { pageTitle: string }) {
  const { user, logout } = useAuth();
  const { language } = useAppLanguage();
  const pathname = usePathname();
  const qc = useQueryClient();
  const copy = COPY[language];

  const [scrolled,   setScrolled]   = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey:        ["notifications-count"],
    queryFn:         () => notificationsApi.unreadCount().then(r => r.data),
    refetchInterval: 60_000,
    enabled:         !!user,
  });
  const unreadCount = unreadData?.count ?? 0;

  const handleCloseNotif = () => {
    setNotifOpen(false);
    qc.invalidateQueries({ queryKey: ["notifications-count"] });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
    setNotifOpen(false);
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

  const initials    = user?.email?.slice(0, 2).toUpperCase() ?? "NU";
  const visibleNav  = NAV_ITEMS.filter(item => user?.role && item.roles.includes(user.role));
  const logoHref    =
    user?.role === "ADMIN"      ? "/admin" :
    user?.role === "ENTREPRISE" ? "/company/dashboard" :
    "/discover";

  return (
    <>
      <header style={{
        position:     "sticky", top: 0, zIndex: 100, height: 85,
        display:      "flex", alignItems: "center", padding: "0 24px", gap: 8,
        background:   scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(16,64,107,0.09)" : "1px solid transparent",
        transition:   "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        boxShadow:    scrolled ? "0 2px 20px rgba(16,64,107,0.07)" : "none",
      }}>
        <Link href={logoHref} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <BrandLogo height={60} />
        </Link>

        {/* Desktop nav */}
        <nav className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 16 }}>
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8,
                fontSize: 13, fontWeight: active ? 700 : 500,
                fontFamily: "'Outfit', sans-serif", textDecoration: "none",
                color:      active ? "#ed823b" : "#2583c0",
                background: active ? "rgba(16,64,107,0.07)" : "transparent",
                transition: "all 0.15s ease",
              }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(16,64,107,0.04)"; (e.currentTarget as HTMLElement).style.color = "#10406B"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#5A7A96"; } }}
              >
                <item.icon size={14} />{copy[item.labelKey]}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div className="hide-mobile" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#EE813D" }}>
          {pageTitle}
        </div>

        {/* Bell */}
        {user && (
          <button onClick={() => setNotifOpen(o => !o)} style={{
            position: "relative", width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: notifOpen ? "rgba(16,64,107,0.08)" : "rgba(16,64,107,0.04)",
            border: "1px solid rgba(16,64,107,0.1)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bell size={16} color={notifOpen ? "#10406B" : "#5A7A96"} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                minWidth: 17, height: 17, borderRadius: 99,
                background: "#EE813D", color: "white",
                fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", border: "2px solid white",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* User dropdown */}
        <div ref={userMenuRef} className="hide-mobile" style={{ position: "relative" }}>
          <button onClick={() => setUserOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px 5px 5px", borderRadius: 99,
            background: "transparent", border: "1px solid rgba(16,64,107,0.1)", cursor: "pointer",
          }}>
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
              <Link
                href={user?.role === "ADMIN" ? "/admin" : user?.role === "ENTREPRISE" ? "/company/profile" : "/profile"}
                onClick={() => setUserOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", fontSize: 13, fontWeight: 500, color: "#0D2137", textDecoration: "none", borderBottom: "1px solid rgba(16,64,107,0.05)" }}
              >
                <User size={13} color="#5A7A96" /> {copy.profile}
              </Link>
              <button onClick={() => { logout(); setUserOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#D64045", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                <LogOut size={14} /> {copy.logout}
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(o => !o)} className="show-mobile-flex"
          style={{ width: 38, height: 38, borderRadius: 10, display: "none", alignItems: "center", justifyContent: "center", background: "rgba(16,64,107,0.05)", border: "none", cursor: "pointer" }}>
          {mobileOpen ? <X size={20} color="#10406B" /> : <Menu size={20} color="#10406B" />}
        </button>
      </header>

      {/* Notifications panel */}
      {notifOpen && (
        <>
          <div onClick={handleCloseNotif} style={{ position: "fixed", inset: 0, zIndex: 149, background: "rgba(13,33,55,0.2)" }} />
          <NotificationsPanel onClose={handleCloseNotif} userRole={user?.role as "CANDIDAT" | "ENTREPRISE" | "ADMIN"} />        </>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98, background: "rgba(13,33,55,0.3)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "fixed", top: 66, left: 0, right: 0, zIndex: 99, background: "white", borderBottom: "1px solid rgba(16,64,107,0.09)", boxShadow: "0 8px 32px rgba(16,64,107,0.12)", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#F7F8FA", borderRadius: 14, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #EE813D, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: "#5A7A96" }}>{copy.candidate}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
              {visibleNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 12, fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#10406B" : "#0D2137",
                    background: active ? "rgba(16,64,107,0.07)" : "transparent",
                    textDecoration: "none",
                  }}>
                    <item.icon size={16} color={active ? "#10406B" : "#5A7A96"} />{copy[item.labelKey]}
                  </Link>
                );
              })}
              <button onClick={() => { setMobileOpen(false); setNotifOpen(true); }} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                color: "#0D2137", background: "transparent", border: "none",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%", textAlign: "left",
              }}>
                <Bell size={16} color="#5A7A96" />
                Notifications
                {unreadCount > 0 && (
                  <span style={{ background: "#EE813D", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, marginLeft: 4 }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div style={{ borderTop: "1px solid rgba(16,64,107,0.07)", paddingTop: 8 }}>
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