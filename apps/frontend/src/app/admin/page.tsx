// frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, Building2, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { type EntrepriseAdmin } from "@/lib/api";

import { OffresTab }              from "./components/OffresTab";
import { EntreprisesTab }         from "./components/Entreprisestab";
import { CandidatsTab }           from "./components/CandidatsTab";
import { AdminCreateOfferModal }  from "./components/AdminCreateOfferModal";
import { EntrepriseDetailModal }  from "./components/EntrepriseDetailModal";
import { CreateCandidatModal }    from "./components/CreateCandidatModal";
import { CreateEntrepriseModal }  from "./components/CreateEntrepriseModal";
import { useAdminPending, useAdminEntreprises, useAdminCandidats } from "./_hooks/useAdminData";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";


type AdminTab = "offers" | "entreprises" | "candidats";

export default function AdminPage() {
  const [tab,                  setTab]                  = useState<AdminTab>("offers");
  const [showCreateModal,      setShowCreateModal]      = useState(false);
  const [showCreateCandidat,   setShowCreateCandidat]   = useState(false);
  const [showCreateEntreprise, setShowCreateEntreprise] = useState(false);
  const [selectedEntreprise,   setSelectedEntreprise]   = useState<EntrepriseAdmin | null>(null);

  const { data: pending     = [], isLoading: loadingOffers      } = useAdminPending();
  const { data: entreprises = [], isLoading: loadingEntreprises } = useAdminEntreprises(true);
  const { data: candidats   = [], isLoading: loadingCandidats   } = useAdminCandidats(true);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/profile");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return null;
  }

  const totalCandidatures = entreprises.reduce(
    (s, e) => s + e.offres.reduce((ss, o) => ss + o._count.candidatures, 0), 0,
  );

  const tabs: { key: AdminTab; label: string; badge?: number }[] = [
    { key:"offers",      label:"Offres",      badge: pending.length },
    { key:"entreprises", label:"Entreprises" },
    { key:"candidats",   label:"Candidats"  },
  ];

  const actionButtons = [
    { label:"+ Candidat",   bg:"linear-gradient(135deg,#1A9E6F,#0d7a54)", shadow:"rgba(26,158,111,0.3)", onClick:() => setShowCreateCandidat(true)   },
    { label:"+ Entreprise", bg:"linear-gradient(135deg,#EE813D,#d4691f)", shadow:"rgba(238,129,61,0.3)",  onClick:() => setShowCreateEntreprise(true) },
    { label:"+ Offre",      bg:"linear-gradient(135deg,#10406B,#2284C0)", shadow:"rgba(16,64,107,0.25)",  onClick:() => setShowCreateModal(true)      },
  ];



  return (
    <AppShell pageTitle="Administration">
      <style>{`
        @keyframes shimmer { 0%{ background-position:200% 0; } 100%{ background-position:-200% 0; } }
        .adm-shimmer { width:36px; height:24px; border-radius:6px; background:linear-gradient(90deg,#F0F4F8 25%,#E4EAF0 50%,#F0F4F8 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; }

        .adm-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; gap:16px; }
        .adm-stats  { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
        .adm-tabs   { display:flex; gap:4px; background:#F7F8FA; border-radius:12px; padding:4px; margin-bottom:24px; width:fit-content; max-width:100%; overflow-x:auto; scrollbar-width:none; }
        .adm-tabs::-webkit-scrollbar { display:none; }

        .adm-action-btns {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }
        .adm-action-btns button {
          display: flex; align-items: center; gap: 6px;
          padding: 11px 16px; border-radius: 12px; border: none;
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          transition: opacity 0.18s, transform 0.18s;
        }
        .adm-action-btns button:hover { opacity:0.9; transform:translateY(-1px); }

        /* Mobile: hide from header, show centered row below it */
        .adm-mobile-btns {
          display: none;
          gap: 8px;
          justify-content: center;
          margin-bottom: 20px;
        }
        .adm-mobile-btns button {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          gap: 5px; padding: 11px 10px;
          border-radius: 12px; border: none;
          color: white; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.18s;
        }
        .adm-mobile-btns button:hover { opacity:0.9; }

        @media(max-width:900px) {
          .adm-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
        }
        @media(max-width:640px) {
          .adm-action-btns { display:none; }
          .adm-mobile-btns { display:flex; }
          .adm-stats  { grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
          .adm-tabs   { width:100%; }
          .adm-header { margin-bottom:16px; }
        }
        @media(max-width:420px) {
          .adm-stats { grid-template-columns:1fr; }
          .adm-mobile-btns button { font-size:11px; padding:10px 8px; }
        }
      `}</style>

      {/* Modals */}
      {showCreateModal      && <AdminCreateOfferModal  onClose={() => setShowCreateModal(false)}/>}
      {showCreateCandidat   && <CreateCandidatModal    onClose={() => setShowCreateCandidat(false)}/>}
      {showCreateEntreprise && <CreateEntrepriseModal  onClose={() => setShowCreateEntreprise(false)}/>}
      {selectedEntreprise   && <EntrepriseDetailModal  entreprise={selectedEntreprise} onClose={() => setSelectedEntreprise(null)}/>}

      {/* Header */}
      <div className="adm-header">
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"rgba(214,64,69,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Shield size={15} color="#D64045"/>
            </div>
            <span style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#D64045" }}>Accès restreint</span>
          </div>
          <h1 className="font-display" style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:900, color:"#10406B", letterSpacing:"-0.02em", marginBottom:4 }}>
            Panneau Administrateur
          </h1>
          <p style={{ color:"#5A7A96", fontSize:"clamp(13px,2vw,15px)" }}>Modérez les offres, gérez les entreprises et les candidats</p>
        </div>

        {/* Desktop action buttons (inline with header) */}
        <div className="adm-action-btns">
          {actionButtons.map(b => (
            <button key={b.label} onClick={b.onClick} style={{ background:b.bg, boxShadow:`0 4px 16px ${b.shadow}` }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile action buttons (centered row, below header) */}
      <div className="adm-mobile-btns">
        {actionButtons.map(b => (
          <button key={b.label} onClick={b.onClick} style={{ background:b.bg, boxShadow:`0 4px 12px ${b.shadow}` }}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="adm-stats">
        {[
          { value:pending.length,      label:"En attente",   color:"#EE813D", Icon:Clock,     bg:"rgba(238,129,61,0.1)",  loading:loadingOffers      },
          { value:entreprises.length,  label:"Entreprises",  color:"#2284C0", Icon:Building2, bg:"rgba(34,132,192,0.1)",  loading:loadingEntreprises },
          { value:candidats.length,    label:"Candidats",    color:"#1A9E6F", Icon:Users,     bg:"rgba(26,158,111,0.1)",  loading:loadingCandidats   },
          { value:totalCandidatures,   label:"Candidatures", color:"#EE813D", Icon:Users,     bg:"rgba(238,129,61,0.08)", loading:loadingEntreprises },
        ].map((s, i) => (
          <div key={i} style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:14, padding:"14px 16px", boxShadow:"0 1px 6px rgba(16,64,107,0.05)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <s.Icon size={18} color={s.color}/>
            </div>
            <div>
              {s.loading
                ? <div className="adm-shimmer"/>
                : <div className="font-display" style={{ fontSize:"clamp(20px,3vw,24px)", fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              }
              <div style={{ fontSize:11, color:"#5A7A96", marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {tabs.map(({ key, label, badge }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:"9px 18px", borderRadius:9, border:"none", fontSize:13, fontWeight:600,
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
            background: tab===key ? "white" : "transparent",
            color:      tab===key ? "#10406B" : "#5A7A96",
            boxShadow:  tab===key ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
            whiteSpace:"nowrap", flexShrink:0,
          }}>
            {label}
            {badge != null && badge > 0 && (
              <span style={{ marginLeft:6, background:"#EE813D", color:"white", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:99 }}>{badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "offers"      && <OffresTab      pending={pending}         loading={loadingOffers}/>}
      {tab === "entreprises" && <EntreprisesTab  entreprises={entreprises} loading={loadingEntreprises} onSelect={setSelectedEntreprise}/>}
      {tab === "candidats"   && <CandidatsTab/>}
    </AppShell>
  );
}