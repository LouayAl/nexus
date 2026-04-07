// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { Shield, Clock, Building2, Users, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { type EntrepriseAdmin } from "@/lib/api";

import { OffresTab }              from "./components/OffresTab";
import { EntreprisesTab }         from "./components/Entreprisestab";
import { CandidatsTab }           from "./components/CandidatsTab";
import { AdminCreateOfferModal }  from "./components/AdminCreateOfferModal";
import { EntrepriseDetailModal }  from "./components/EntrepriseDetailModal";
import { useAdminPending, useAdminEntreprises, useAdminCandidats } from "./_hooks/useAdminData";

type AdminTab = "offers" | "entreprises" | "candidats";

export default function AdminPage() {
  const [tab,               setTab]              = useState<AdminTab>("offers");
  const [showCreateModal,   setShowCreateModal]  = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<EntrepriseAdmin | null>(null);

  const { data: pending      = [], isLoading: loadingOffers      } = useAdminPending();
  const { data: entreprises  = [], isLoading: loadingEntreprises } = useAdminEntreprises(tab === "entreprises");
  const { data: candidats    = []                                 } = useAdminCandidats(tab === "candidats");

  // Stats
  const totalCandidatures = entreprises.reduce(
    (s, e) => s + e.offres.reduce((ss, o) => ss + o._count.candidatures, 0), 0,
  );

  const tabs: { key: AdminTab; label: string; badge?: number }[] = [
    { key: "offers",      label: "Offres en attente", badge: pending.length },
    { key: "entreprises", label: "Entreprises" },
    { key: "candidats",   label: "Candidats" },
  ];

  return (
    <AppShell pageTitle="Administration">
      {/* Modals */}
      {showCreateModal    && <AdminCreateOfferModal onClose={() => setShowCreateModal(false)} />}
      {selectedEntreprise && <EntrepriseDetailModal entreprise={selectedEntreprise} onClose={() => setSelectedEntreprise(null)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(214,64,69,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={15} color="#D64045" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#D64045" }}>Accès restreint</span>
          </div>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Panneau Administrateur
          </h1>
          <p style={{ color: "#5A7A96", fontSize: 15 }}>Modérez les offres, gérez les entreprises et les candidats</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 22px", borderRadius: 12,
            background: "linear-gradient(135deg, #10406B, #2284C0)",
            border: "none", color: "white", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 4px 20px rgba(16,64,107,0.25)",
          }}
        >
          <Plus size={15} /> Créer une offre
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { value: pending.length,           label: "En attente",   color: "#EE813D", Icon: Clock,     bg: "rgba(238,129,61,0.1)"  },
          { value: entreprises.length || "—", label: "Entreprises", color: "#2284C0", Icon: Building2, bg: "rgba(34,132,192,0.1)"  },
          { value: candidats.length  || "—",  label: "Candidats",   color: "#1A9E6F", Icon: Users,     bg: "rgba(26,158,111,0.1)"  },
          { value: totalCandidatures || "—",  label: "Candidatures",color: "#EE813D", Icon: Users,     bg: "rgba(238,129,61,0.08)" },
        ].map((s, i) => (
          <div
            key={i}
            style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 6px rgba(16,64,107,0.05)", display: "flex", alignItems: "center", gap: 14 }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.Icon size={20} color={s.color} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#5A7A96", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F7F8FA", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "9px 20px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
              background: tab === key ? "white" : "transparent",
              color:      tab === key ? "#10406B" : "#5A7A96",
              boxShadow:  tab === key ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
            }}
          >
            {label}
            {badge != null && badge > 0 && (
              <span style={{ marginLeft: 6, background: "#EE813D", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "offers"      && <OffresTab      pending={pending}         loading={loadingOffers} />}
      {tab === "entreprises" && <EntreprisesTab  entreprises={entreprises} loading={loadingEntreprises} onSelect={setSelectedEntreprise} />}
      {tab === "candidats"   && <CandidatsTab />}
    </AppShell>
  );
}