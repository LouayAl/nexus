"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

// ── Role-based nav links ──────────────────────────────────────────────────────
const CANDIDAT_LINKS = [
  { href:"/discover",     label:"Offres"        },
  { href:"/applications", label:"Candidatures"  },
  { href:"/profile",      label:"Mon Profil"    },
];

const ENTREPRISE_LINKS = [
  { href:"/discover",          label:"Offres"        },
  { href:"/company/dashboard", label:"Tableau de bord" },
  { href:"/company/candidats",  label:"Candidats"       },
  { href:"/company/profile",   label:"Mon Profil"      },
];

const ADMIN_LINKS = [
  { href:"/discover", label:"Offres"  },
  { href:"/admin",    label:"Admin"   },
];

function getLinks(role?: string) {
  if (role === "ENTREPRISE") return ENTREPRISE_LINKS;
  if (role === "ADMIN")      return ADMIN_LINKS;
  return CANDIDAT_LINKS;
}

function getProfileHref(role?: string) {
  if (role === "ENTREPRISE") return "/company/profile";
  return "/profile";
}

// ─────────────────────────────────────────────────────────────────────────────
export function TopNav({ pageTitle, notifCount = 0, onNotifClick, notifOpen }: {
  pageTitle:    string;
  notifCount?:  number;
  onNotifClick: () => void;
  notifOpen:    boolean;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links       = getLinks(user?.role);
  const profileHref = getProfileHref(user?.role);

  const initials =
    user?.role === "CANDIDAT"   ? "ME" :
    user?.role === "ENTREPRISE" ? "EN" :
    user?.role === "ADMIN"      ? "AD" : "?";

  return (
    <>
      <header style={{
        position:"sticky", top:0, zIndex:100, height:66,
        display:"flex", alignItems:"center", padding:"0 32px", gap:32,
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(16,64,107,0.09)" : "1px solid transparent",
        transition:"background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: scrolled ? "0 2px 20px rgba(16,64,107,0.07)" : "none",
      }}>

        {/* Logo */}
        <Link href={user?.role === "ENTREPRISE" ? "/company/dashboard" : "/discover"} style={{ textDecoration:"none", flexShrink:0, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg, #EE813D, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(238,129,61,0.35)" }}>
            <span style={{ color:"white", fontSize:16, fontWeight:900, fontFamily:"'Fraunces', serif" }}>N</span>
          </div>
          <span className="font-display" style={{ fontSize:20, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>nexus</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display:"flex", gap:4, flex:1 }}>
          {links.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} style={{
                padding:"6px 14px", borderRadius:99, fontSize:14,
                fontWeight: active ? 600 : 500, textDecoration:"none",
                color:      active ? "#10406B" : "#5A7A96",
                background: active ? "rgba(16,64,107,0.07)" : "transparent",
                transition:"all 0.18s ease",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color="#10406B"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color="#5A7A96"; }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Bell */}
          <button onClick={onNotifClick} style={{
            position:"relative", width:38, height:38, borderRadius:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            background: notifOpen ? "rgba(34,132,192,0.08)" : "transparent",
            border:"none", cursor:"pointer", transition:"background 0.18s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background="rgba(16,64,107,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background=notifOpen?"rgba(34,132,192,0.08)":"transparent")}
          >
            <Bell size={18} color={notifOpen ? "#2284C0" : "#5A7A96"}/>
            {notifCount > 0 && (
              <span style={{ position:"absolute", top:7, right:7, width:8, height:8, borderRadius:"50%", background:"#EE813D", border:"2px solid white" }}/>
            )}
          </button>

          <div style={{ width:1, height:24, background:"rgba(16,64,107,0.1)" }}/>

          {/* User dropdown */}
          <div style={{ position:"relative" }}>
            <button onClick={() => setUserOpen(!userOpen)} style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"5px 10px 5px 5px", borderRadius:99,
              background:"transparent", border:"1px solid rgba(16,64,107,0.1)",
              cursor:"pointer", transition:"all 0.18s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor="rgba(16,64,107,0.25)")}
            onMouseLeave={e => { if (!userOpen) (e.currentTarget as HTMLElement).style.borderColor="rgba(16,64,107,0.1)"; }}
            >
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, #EE813D, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white" }}>
                {initials}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:"#0D2137" }}>
                {user?.email?.split("@")[0] ?? "Compte"}
              </span>
              <ChevronDown size={13} color="#5A7A96"/>
            </button>

            {userOpen && (
              <div style={{ position:"absolute", right:0, top:"calc(100% + 10px)", width:210, borderRadius:14, overflow:"hidden", zIndex:200, background:"white", border:"1px solid rgba(16,64,107,0.1)", boxShadow:"0 12px 40px rgba(16,64,107,0.14)" }}>
                <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0D2137" }}>{user?.email}</div>
                  <div style={{ fontSize:11, color:"#5A7A96", marginTop:2, textTransform:"capitalize" }}>
                    {user?.role === "ENTREPRISE" ? "Recruteur" : user?.role === "CANDIDAT" ? "Candidat" : "Admin"}
                  </div>
                </div>
                {/* Profile link in dropdown */}
                <Link href={profileHref} onClick={() => setUserOpen(false)} style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"11px 16px", fontSize:13, fontWeight:500,
                  color:"#0D2137", textDecoration:"none",
                  borderBottom:"1px solid rgba(16,64,107,0.05)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background="rgba(16,64,107,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                >
                  <User size={13} color="#5A7A96"/> Mon profil
                </Link>
                <button onClick={() => { logout(); setUserOpen(false); }} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:8,
                  padding:"12px 16px", fontSize:13, fontWeight:500,
                  color:"#D64045", background:"none", border:"none",
                  cursor:"pointer", fontFamily:"'DM Sans', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background="rgba(214,64,69,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                >
                  <LogOut size={14}/> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {userOpen && <div onClick={() => setUserOpen(false)} style={{ position:"fixed", inset:0, zIndex:99 }}/>}
    </>
  );
}