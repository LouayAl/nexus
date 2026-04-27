// frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, Building2, Users, ArrowRight, CheckCircle, Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAdminPending, useAdminEntreprises, useAdminCandidats } from "./_hooks/useAdminData";
import { AdminCreateOfferModal }  from "./components/AdminCreateOfferModal";
import { CreateCandidatModal }    from "./components/CreateCandidatModal";
import { CreateEntrepriseModal }  from "./components/CreateEntrepriseModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useAppLanguage } from "@/hooks/useAppLanguage";

export default function AdminPage() {
  const { data: pending     = [], isLoading: loadingOffers      } = useAdminPending();
  const { data: entreprises = [], isLoading: loadingEntreprises } = useAdminEntreprises(true);
  const { data: candidats   = [], isLoading: loadingCandidats   } = useAdminCandidats(true);

  const { user, loading } = useAuth();
  const router = useRouter();

  const [showCreateModal,      setShowCreateModal]      = useState(false);
  const [showCreateCandidat,   setShowCreateCandidat]   = useState(false);
  const [showCreateEntreprise, setShowCreateEntreprise] = useState(false);
  const { language, setLanguage } = useAppLanguage();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/profile"); return; }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") return null;

  const totalCandidatures = entreprises.reduce(
    (s, e) => s + e.offres.reduce((ss, o) => ss + o._count.candidatures, 0), 0,
  );
  const totalOffres = entreprises.reduce((s, e) => s + e._count.offres, 0);

  const navCards = [
    {
      href:       "/admin/offres",
      icon:       Clock,
      color:      "#EE813D",
      bg:         "rgba(238,129,61,0.1)",
      title:      "Offres en attente",
      value:      pending.length,
      desc:       "Modérer les offres soumises",
      badge:      pending.length > 0 ? `${pending.length} à traiter` : "Tout est à jour",
      badgeBg:    pending.length > 0 ? "rgba(238,129,61,0.12)" : "rgba(26,158,111,0.1)",
      badgeColor: pending.length > 0 ? "#EE813D" : "#1A9E6F",
      loading:    loadingOffers,
    },
    {
      href:       "/admin/entreprises",
      icon:       Building2,
      color:      "#2284C0",
      bg:         "rgba(34,132,192,0.1)",
      title:      "Entreprises",
      value:      entreprises.length,
      desc:       "Gérer les comptes entreprises",
      badge:      `${totalOffres} offres publiées`,
      badgeBg:    "rgba(34,132,192,0.1)",
      badgeColor: "#2284C0",
      loading:    loadingEntreprises,
    },
    {
      href:       "/admin/candidats",
      icon:       Users,
      color:      "#1A9E6F",
      bg:         "rgba(26,158,111,0.1)",
      title:      "Candidats",
      value:      candidats.length,
      desc:       "Gérer les profils candidats",
      badge:      `${totalCandidatures} candidatures`,
      badgeBg:    "rgba(26,158,111,0.1)",
      badgeColor: "#1A9E6F",
      loading:    loadingCandidats,
    },
  ];

  const actionButtons = [
    { label: "+ Candidat",   bg: "linear-gradient(135deg,#1A9E6F,#0d7a54)", shadow: "rgba(26,158,111,0.3)",  onClick: () => setShowCreateCandidat(true)   },
    { label: "+ Entreprise", bg: "linear-gradient(135deg,#EE813D,#d4691f)", shadow: "rgba(238,129,61,0.3)",  onClick: () => setShowCreateEntreprise(true) },
    { label: "+ Offre",      bg: "linear-gradient(135deg,#10406B,#2284C0)", shadow: "rgba(16,64,107,0.25)", onClick: () => setShowCreateModal(true)      },
  ];

  return (
    <AppShell pageTitle="Administration">
      <style>{`
        @keyframes shimmer { 0%{ background-position:200% 0; } 100%{ background-position:-200% 0; } }
        .adm-shimmer { width:48px; height:32px; border-radius:8px; background:linear-gradient(90deg,#F0F4F8 25%,#E4EAF0 50%,#F0F4F8 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; display:inline-block; }

        .nav-card { background:white; border:1px solid rgba(16,64,107,0.08); border-radius:20px; padding:28px; display:flex; flex-direction:column; gap:20px; text-decoration:none; transition:all 0.2s; box-shadow:0 2px 12px rgba(16,64,107,0.06); }
        .nav-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(16,64,107,0.12); border-color:rgba(34,132,192,0.2); }

        .quick-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }

        .adm-action-btns { display:flex; gap:10px; align-items:center; flex-shrink:0; }
        .adm-action-btns button { display:flex; align-items:center; gap:6px; padding:11px 16px; border-radius:12px; border:none; color:white; font-size:13px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; white-space:nowrap; transition:opacity 0.18s, transform 0.18s; }
        .adm-action-btns button:hover { opacity:0.9; transform:translateY(-1px); }

        .adm-mobile-btns { display:none; gap:8px; justify-content:center; margin-bottom:24px; }
        .adm-mobile-btns button { flex:1; display:flex; align-items:center; justify-content:center; gap:5px; padding:11px 10px; border-radius:12px; border:none; color:white; font-size:12px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity 0.18s; }
        .adm-mobile-btns button:hover { opacity:0.9; }

        @media(max-width:768px) { .quick-grid { grid-template-columns:1fr; } }
        @media(max-width:640px) {
          .adm-action-btns { display:none; }
          .adm-mobile-btns { display:flex; }
          .nav-card { padding:20px; }
        }
      `}</style>

      {/* Modals */}
      {showCreateModal      && <AdminCreateOfferModal onClose={() => setShowCreateModal(false)} />}
      {showCreateCandidat   && <CreateCandidatModal   onClose={() => setShowCreateCandidat(false)} />}
      {showCreateEntreprise && <CreateEntrepriseModal onClose={() => setShowCreateEntreprise(false)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(214,64,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={15} color="#D64045" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#D64045" }}>Accès restreint</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Panneau Administrateur
          </h1>
          <p style={{ color: "#5A7A96", fontSize: 15 }}>Sélectionnez une section ou créez un nouvel élément.</p>
          
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageToggle language={language} onChange={setLanguage} />
          <div className="adm-action-btns">
            {actionButtons.map(b => (
              <button key={b.label} onClick={b.onClick} style={{ background: b.bg, boxShadow: `0 4px 16px ${b.shadow}` }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        {/* Desktop create buttons */}
        <div className="adm-action-btns">
          {actionButtons.map(b => (
            <button key={b.label} onClick={b.onClick} style={{ background: b.bg, boxShadow: `0 4px 16px ${b.shadow}` }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile create buttons */}
      <div className="adm-mobile-btns">
        {actionButtons.map(b => (
          <button key={b.label} onClick={b.onClick} style={{ background: b.bg, boxShadow: `0 4px 12px ${b.shadow}` }}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Nav cards */}
      <div className="quick-grid">
        {navCards.map(card => (
          <Link key={card.href} href={card.href} className="nav-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <card.icon size={22} color={card.color} />
              </div>
              <ArrowRight size={18} color="#B0C4D4" />
            </div>
            <div>
              {card.loading
                ? <div className="adm-shimmer" />
                : <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
              }
              <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "#0D2137", marginTop: 6 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: "#5A7A96", marginTop: 3 }}>{card.desc}</div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: card.badgeBg, color: card.badgeColor, fontSize: 12, fontWeight: 700, width: "fit-content" }}>
              {card.title === "Offres en attente" && pending.length === 0 ? <CheckCircle size={12} /> : <Briefcase size={12} />}
              {card.badge}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent pending preview */}
      {pending.length > 0 && (
        <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "#0D2137" }}>Dernières offres en attente</div>
            <Link href="/admin/offres" style={{ fontSize: 13, color: "#2284C0", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.slice(0, 3).map(o => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#F7F8FA", borderRadius: 12, gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0D2137", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.titre}</div>
                  <div style={{ fontSize: 12, color: "#5A7A96", marginTop: 2 }}>{o.entreprise?.nom} · {o.type_contrat}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(238,129,61,0.1)", color: "#EE813D", whiteSpace: "nowrap", flexShrink: 0 }}>En attente</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}