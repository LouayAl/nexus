// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Users, Clock, CheckCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { OfferFormModal, OfferDetailModal, CandidatsModal, OfferCard, ChartTooltip } from "../dashboard";
import { Offre, offresApi } from "@/lib/api"; 

type ModalState = { type: "none" } | { type: "create" } | { type: "edit"; offre: Offre } | { type: "detail"; offre: Offre } | { type: "candidats"; offre: Offre };

export default function CompanyDashboardPage() {
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [offres, setOffres] = useState<Offre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch offers on mount
  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await offresApi.mesOffres();
      setOffres(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCandidatures = offres.reduce((sum, o) => sum + (o._count?.candidatures ?? 0), 0);
  const ouvertes = offres.filter(o => o.statut === "OUVERTE").length;
  const enAttente = offres.filter(o => o.statut === "EN_ATTENTE").length;
  const fermees = offres.filter(o => o.statut === "FERMEE").length;

  const offreBarData = offres.slice(0, 6).map(o => ({ name: o.titre.length > 18 ? o.titre.slice(0, 18) + "…" : o.titre, candidats: o._count?.candidatures ?? 0 }));
  const statutPieData = [
    { name: "Ouvertes", value: ouvertes, color: "#1A9E6F" },
    { name: "En attente", value: enAttente, color: "#EE813D" },
    { name: "Fermées", value: fermees, color: "#D64045" },
  ].filter(d => d.value > 0);

  const trendData = [
    { semaine: "S-5", candidatures: Math.max(0, totalCandidatures - 20) },
    { semaine: "S-4", candidatures: Math.max(0, totalCandidatures - 14) },
    { semaine: "S-3", candidatures: Math.max(0, totalCandidatures - 9) },
    { semaine: "S-2", candidatures: Math.max(0, totalCandidatures - 4) },
    { semaine: "S-1", candidatures: Math.max(0, totalCandidatures - 1) },
    { semaine: "Cette semaine", candidatures: totalCandidatures },
  ];

  const closeModal = () => setModal({ type: "none" });

  // Refresh offers after create/edit
  const handleModalClose = () => {
    closeModal();
    loadOffers();
  };

  return (
    <AppShell pageTitle="Dashboard Recruteur">
      {modal.type === "create" && <OfferFormModal onClose={handleModalClose} />}
      {modal.type === "edit" && <OfferFormModal offre={modal.offre} onClose={handleModalClose} />}
      {modal.type === "detail" && <OfferDetailModal offre={modal.offre} onClose={closeModal} onStatusChange={() => loadOffers()} onEdit={() => setModal({ type: "edit", offre: modal.offre })} onViewCandidats={() => setModal({ type: "candidats", offre: modal.offre })} />}
      {modal.type === "candidats" && <CandidatsModal offre={modal.offre} onClose={closeModal} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#EE813D", marginBottom: 8 }}>Espace recruteur</div>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}>Tableau de bord</h1>
          <p style={{ color: "#5A7A96", fontSize: 15 }}>Gérez vos offres et suivez vos candidatures</p>
        </div>
        <button onClick={() => setModal({ type: "create" })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: "linear-gradient(135deg, #EE813D, #d4691f)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 20px rgba(238,129,61,0.35)" }}><Plus size={15} /> Nouvelle offre</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
        {[{ label: "Offres publiées", value: offres.length, color: "#2284C0", icon: Briefcase, sub: `${ouvertes} ouverte${ouvertes !== 1 ? "s" : ""}` }, { label: "Candidatures", value: totalCandidatures, color: "#EE813D", icon: Users, sub: "au total" }, { label: "En validation", value: enAttente, color: "#7C3AED", icon: Clock, sub: "offres en attente" }, { label: "Offres fermées", value: fermees, color: "#D64045", icon: CheckCircle, sub: "recrutement terminé" }].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 6px rgba(16,64,107,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={20} color={s.color} /></div>
            <div><div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12, color: "#5A7A96", marginTop: 3, fontWeight: 500 }}>{s.label}</div><div style={{ fontSize: 11, color: "#B0C4D4", marginTop: 1 }}>{s.sub}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 1px 6px rgba(16,64,107,0.05)" }}>
          <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Évolution</div><div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Candidatures reçues</div></div>
          <ResponsiveContainer width="100%" height={160}><AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}><defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2284C0" stopOpacity={0.15} /><stop offset="95%" stopColor="#2284C0" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(16,64,107,0.05)" /><XAxis dataKey="semaine" tick={{ fontSize: 10, fill: "#B0C4D4" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#B0C4D4" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="candidatures" stroke="#2284C0" strokeWidth={2} fill="url(#areaGrad)" name="Candidatures" /></AreaChart></ResponsiveContainer>
        </div>
        <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 1px 6px rgba(16,64,107,0.05)" }}>
          <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Par offre</div><div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Candidatures par poste</div></div>
          <ResponsiveContainer width="100%" height={160}><BarChart data={offreBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(16,64,107,0.05)" /><XAxis dataKey="name" tick={{ fontSize: 9, fill: "#B0C4D4" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#B0C4D4" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="candidats" fill="#EE813D" radius={[6, 6, 0, 0]} name="Candidats" maxBarSize={36} /></BarChart></ResponsiveContainer>
        </div>
        <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 1px 6px rgba(16,64,107,0.05)" }}>
          <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Répartition</div><div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Statut des offres</div></div>
          {statutPieData.length === 0 ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "#B0C4D4", fontSize: 13 }}>Aucune offre</div> : (
            <>
              <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={statutPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">{statutPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>{statutPieData.map(d => <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} /><span style={{ fontSize: 11, color: "#5A7A96" }}>{d.name}</span></div><span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</span></div>)}</div>
            </>
          )}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Mes offres</div><div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "#0D2137" }}>{offres.length} offre{offres.length !== 1 ? "s" : ""} publiée{offres.length !== 1 ? "s" : ""}</div></div>
        </div>
        {isLoading ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}><span style={{ color: "#5A7A96" }}>Chargement…</span></div> : offres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#10406B", marginBottom: 8 }}>Aucune offre publiée</div>
            <div style={{ color: "#5A7A96", fontSize: 14, marginBottom: 24 }}>Créez votre première offre pour commencer à recruter</div>
            <button onClick={() => setModal({ type: "create" })} style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #EE813D, #d4691f)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}><Plus size={14} /> Créer une offre</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
            {offres.map(o => <OfferCard key={o.id} offre={o} onClick={() => setModal({ type: "detail", offre: o })} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}