"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, FileText, Building2, Shield, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { theme } from "@/lib/theme";

const NAV_ITEMS = [
  { href: "/discover",          icon: Compass,  label: "Découvrir",    roles: ["CANDIDAT","ENTREPRISE","ADMIN"] },
  { href: "/applications",      icon: FileText,  label: "Candidatures", roles: ["CANDIDAT"] },
  { href: "/company/dashboard", icon: Building2, label: "Entreprise",   roles: ["ENTREPRISE"] },
  { href: "/admin",             icon: Shield,    label: "Admin",        roles: ["ADMIN"], badge: 3 },
  { href: "/profile",           icon: User,      label: "Mon Profil",   roles: ["CANDIDAT","ENTREPRISE"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visible = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role as string)
  );

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.secondary} 70%)`,
      borderRight: "none",
      padding: "20px 12px",
      overflowY: "auto",
      borderRadius: "0 20px 20px 0",
      boxShadow: "4px 0 24px rgba(16,64,107,0.15), 2px 0 8px rgba(238,129,61,0.08)",
      marginRight: "4px",
    }}>
      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                textDecoration: "none",
                transition: "all 0.18s ease",
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
              }}
            >
              {/* Active indicator bar */}
              <div style={{
                width: 3, height: 18, borderRadius: 2,
                background: active ? theme.accent : "transparent",
                flexShrink: 0,
                transition: "background 0.18s",
              }}/>
              <item.icon size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  width: 18, height: 18, borderRadius: "50%",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: theme.accent, color: "white",
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "12px 0" }} />

      {/* Bottom actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Link
          href="/settings"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 14px", borderRadius: 10,
            fontSize: 13, fontWeight: 500,
            fontFamily: "'Outfit', sans-serif",
            textDecoration: "none",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <div style={{ width: 3, height: 18, borderRadius: 2, background: "transparent", flexShrink: 0 }}/>
          <Settings size={15} />
          <span>Paramètres</span>
        </Link>
        <button
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 14px", borderRadius: 10,
            fontSize: 13, fontWeight: 500,
            fontFamily: "'Outfit', sans-serif",
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,100,100,0.7)", width: "100%", textAlign: "left",
            transition: "color 0.18s",
          }}
        >
          <div style={{ width: 3, height: 18, borderRadius: 2, background: "transparent", flexShrink: 0 }}/>
          <LogOut size={15} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}