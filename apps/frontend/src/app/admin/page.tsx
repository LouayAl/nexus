// frontend/src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { Shield, Clock, Building2, Users, Plus, X } from "lucide-react";
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

type AdminTab = "offers" | "entreprises" | "candidats";

export default function AdminPage() {
  const [tab,                  setTab]                  = useState<AdminTab>("offers");
  const [showCreateModal,      setShowCreateModal]      = useState(false);
  const [showCreateCandidat,   setShowCreateCandidat]   = useState(false);
  const [showCreateEntreprise, setShowCreateEntreprise] = useState(false);
  const [selectedEntreprise,   setSelectedEntreprise]   = useState<EntrepriseAdmin | null>(null);
  const [mobileActionsOpen,    setMobileActionsOpen]    = useState(false);

  const { data: pending     = [], isLoading: loadingOffers      } = useAdminPending();
  const { data: entreprises = [], isLoading: loadingEntreprises } = useAdminEntreprises(tab === "entreprises");
  const { data: candidats   = []                                 } = useAdminCandidats(tab === "candidats");

  const totalCandidatures = entreprises.reduce(
    (s, e) => s + e.offres.reduce((ss, o) => ss + o._count.candidatures, 0), 0,
  );

  const tabs: { key: AdminTab; label: string; badge?: number }[] = [
    { key:"offers",      label:"Offres",      badge: pending.length },
    { key:"entreprises", label:"Entreprises" },
    { key:"candidats",   label:"Candidats"  },
  ];

  const actionButtons = [
    { label:"+ Candidat",   bg:"linear-gradient(135deg,#1A9E6F,#0d7a54)", shadow:"rgba(26,158,111,0.3)", onClick:() => { setShowCreateCandidat(true);   setMobileActionsOpen(false); } },
    { label:"+ Entreprise", bg:"linear-gradient(135deg,#EE813D,#d4691f)", shadow:"rgba(238,129,61,0.3)",  onClick:() => { setShowCreateEntreprise(true); setMobileActionsOpen(false); } },
    { label:"+ Offre",      bg:"linear-gradient(135deg,#10406B,#2284C0)", shadow:"rgba(16,64,107,0.25)",  onClick:() => { setShowCreateModal(true);      setMobileActionsOpen(false); } },
  ];

  return (
    <AppShell pageTitle="Administration">
    <style>{`
      .admin-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
      .admin-actions-desktop { display:flex; gap:10px; }
      .admin-actions-mobile  { display:none; position:relative; }
      .admin-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
      .admin-tabs  { display:flex; gap:4px; background:#F7F8FA; border-radius:12px; padding:4px; margin-bottom:24px; width:fit-content; }
      @media(max-width:900px) {
        .admin-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
      }
      @media(max-width:640px) {
        .admin-actions-desktop { display:none; }
        .admin-actions-mobile  { display:block; }
        .admin-stats { grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; }
        .admin-tabs  { width:100%; overflow-x:auto; scrollbar-width:none; }
        .admin-tabs::-webkit-scrollbar { display:none; }
      }
      @media(max-width:420px) {
        .admin-stats { grid-template-columns:1fr; }
        .admin-header { margin-bottom:20px; }
      }
    `}</style>

      {/* Modals */}
      {showCreateModal      && <AdminCreateOfferModal  onClose={() => setShowCreateModal(false)}/>}
      {showCreateCandidat   && <CreateCandidatModal    onClose={() => setShowCreateCandidat(false)}/>}
      {showCreateEntreprise && <CreateEntrepriseModal  onClose={() => setShowCreateEntreprise(false)}/>}
      {selectedEntreprise   && <EntrepriseDetailModal  entreprise={selectedEntreprise} onClose={() => setSelectedEntreprise(null)}/>}

      {/* Header */}
      <div className="admin-header">
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

        {/* Desktop */}
        <div className="admin-actions-desktop">
          {actionButtons.map(b => (
            <button key={b.label} onClick={b.onClick} style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 16px", borderRadius:12, background:b.bg, border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:`0 4px 16px ${b.shadow}`, whiteSpace:"nowrap" }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Mobile FAB */}
        <div className="admin-actions-mobile">
          <button onClick={() => setMobileActionsOpen(!mobileActionsOpen)} style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#10406B,#2284C0)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 16px rgba(16,64,107,0.25)" }}>
            {mobileActionsOpen ? <X size={18} color="white"/> : <Plus size={18} color="white"/>}
          </button>
          {mobileActionsOpen && (
            <>
              <div onClick={() => setMobileActionsOpen(false)} style={{ position:"fixed", inset:0, zIndex:40 }}/>
              <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", zIndex:50, display:"flex", flexDirection:"column", gap:8, minWidth:180 }}>
                {actionButtons.map(b => (
                  <button key={b.label} onClick={b.onClick} style={{ padding:"12px 16px", borderRadius:12, background:b.bg, border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:`0 4px 16px ${b.shadow}`, whiteSpace:"nowrap", textAlign:"left" }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { value:pending.length,          label:"En attente",   color:"#EE813D", Icon:Clock,     bg:"rgba(238,129,61,0.1)"  },
          { value:entreprises.length||"—", label:"Entreprises",  color:"#2284C0", Icon:Building2, bg:"rgba(34,132,192,0.1)"  },
          { value:candidats.length||"—",   label:"Candidats",    color:"#1A9E6F", Icon:Users,     bg:"rgba(26,158,111,0.1)"  },
          { value:totalCandidatures||"—",  label:"Candidatures", color:"#EE813D", Icon:Users,     bg:"rgba(238,129,61,0.08)" },
        ].map((s, i) => (
          <div key={i} style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:14, padding:"14px 16px", boxShadow:"0 1px 6px rgba(16,64,107,0.05)", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <s.Icon size={18} color={s.color}/>
            </div>
            <div>
              <div className="font-display" style={{ fontSize:"clamp(20px,3vw,24px)", fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#5A7A96", marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
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