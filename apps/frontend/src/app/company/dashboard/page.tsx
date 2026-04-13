"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Briefcase, Users, Clock, CheckCircle,
  Search, Filter, X, Archive, ArchiveRestore,
  ChevronDown, ChevronUp, Trash2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import {
  OfferFormModal, OfferDetailModal, CandidatsModal,
  OfferCard, ChartTooltip,
} from "../dashboard";
import { Offre, offresApi } from "@/lib/api";
import { useArchive } from "./useArchive";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit";      offre: Offre }
  | { type: "detail";    offre: Offre }
  | { type: "candidats"; offre: Offre };

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return width;
}

const CONTRACT_TYPES = ["CDI", "CDD", "Freelance", "Stage", "Alternance"];
const STATUT_OPTIONS = [
  { value: "OUVERTE",    label: "Ouverte"     },
  { value: "EN_ATTENTE", label: "En attente"  },
  { value: "FERMEE",     label: "Fermée"      },
];

export default function CompanyDashboardPage() {
  const [modal,          setModal]          = useState<ModalState>({ type: "none" });
  const [offres,         setOffres]         = useState<Offre[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [chartsExpanded, setChartsExpanded] = useState(false);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState("");
  const [filterStatut,   setFilterStatut]   = useState("");
  const [filterContrat,  setFilterContrat]  = useState("");
  const [filtersOpen,    setFiltersOpen]    = useState(false);

  // ── Archive / selection ───────────────────────────────────────────────────
  const { archived, archive, unarchive, isArchived } = useArchive();
  const [selectMode,     setSelectMode]     = useState(false);
  const [selected,       setSelected]       = useState<Set<number>>(new Set());
  const [archivedOpen,   setArchivedOpen]   = useState(false);

  const width    = useWindowWidth();
  const isMobile = width < 640;

  useEffect(() => { loadOffers(); }, []);

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

  // ── Derived lists ─────────────────────────────────────────────────────────
  const activeOffres   = offres.filter(o => !isArchived(o.id));
  const archivedOffres = offres.filter(o => isArchived(o.id));

  const filteredOffres = useMemo(() => {
    return activeOffres.filter(o => {
      const matchSearch  = !search       || o.titre.toLowerCase().includes(search.toLowerCase()) || (o.localisation ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatut  = !filterStatut  || o.statut       === filterStatut;
      const matchContrat = !filterContrat || o.type_contrat === filterContrat;
      return matchSearch && matchStatut && matchContrat;
    });
  }, [activeOffres, search, filterStatut, filterContrat]);

  const hasFilters = !!(search || filterStatut || filterContrat);
  const resetFilters = () => { setSearch(""); setFilterStatut(""); setFilterContrat(""); };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectAll  = () => setSelected(new Set(filteredOffres.map(o => o.id)));
  const deselectAll = () => setSelected(new Set());
  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };

  const archiveSelected = () => {
    archive([...selected]);
    exitSelectMode();
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCandidatures = activeOffres.reduce((sum, o) => sum + (o._count?.candidatures ?? 0), 0);
  const ouvertes   = activeOffres.filter(o => o.statut === "OUVERTE").length;
  const enAttente  = activeOffres.filter(o => o.statut === "EN_ATTENTE").length;
  const fermees    = activeOffres.filter(o => o.statut === "FERMEE").length;

  const offreBarData = activeOffres.slice(0, 6).map(o => ({
    name: o.titre.length > 18 ? o.titre.slice(0, 18) + "…" : o.titre,
    candidats: o._count?.candidatures ?? 0,
  }));

  const statutPieData = [
    { name: "Ouvertes",   value: ouvertes,  color: "#1A9E6F" },
    { name: "En attente", value: enAttente, color: "#EE813D" },
    { name: "Fermées",    value: fermees,   color: "#D64045" },
  ].filter(d => d.value > 0);

  const trendData = [
    { semaine: "S-5",           candidatures: Math.max(0, totalCandidatures - 20) },
    { semaine: "S-4",           candidatures: Math.max(0, totalCandidatures - 14) },
    { semaine: "S-3",           candidatures: Math.max(0, totalCandidatures - 9)  },
    { semaine: "S-2",           candidatures: Math.max(0, totalCandidatures - 4)  },
    { semaine: "S-1",           candidatures: Math.max(0, totalCandidatures - 1)  },
    { semaine: "Cette semaine", candidatures: totalCandidatures },
  ];

  const closeModal       = () => setModal({ type: "none" });
  const handleModalClose = () => { closeModal(); loadOffers(); };
  const statsColumns     = isMobile ? "1fr 1fr" : "repeat(4, 1fr)";

  return (
    <AppShell pageTitle="Dashboard Recruteur">
      {modal.type === "create"    && <OfferFormModal onClose={handleModalClose} />}
      {modal.type === "edit"      && <OfferFormModal offre={modal.offre} onClose={handleModalClose} />}
      {modal.type === "detail"    && (
        <OfferDetailModal
          offre={modal.offre}
          onClose={closeModal}
          onStatusChange={() => loadOffers()}
          onEdit={() => setModal({ type: "edit", offre: modal.offre })}
          onViewCandidats={() => setModal({ type: "candidats", offre: modal.offre })}
          onDelete={() => loadOffers()}
        />
      )}
      {modal.type === "candidats" && <CandidatsModal offre={modal.offre} onClose={closeModal} />}

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "flex-start", gap: isMobile ? 16 : 0, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#EE813D", marginBottom: 8 }}>Espace recruteur</div>
          <h1 className="font-display" style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}>Tableau de bord</h1>
          <p style={{ color: "#5A7A96", fontSize: 15 }}>Gérez vos offres et suivez vos candidatures</p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 8, padding: "12px 22px", borderRadius: 12, background: "linear-gradient(135deg, #EE813D, #d4691f)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(238,129,61,0.35)", width: isMobile ? "100%" : "auto" }}
        >
          <Plus size={15} /> Nouvelle offre
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: statsColumns, gap: 12, marginBottom: 28 }}>
        {[
          { label: "Offres actives",  value: activeOffres.length,  color: "#2284C0", icon: Briefcase,   sub: `${ouvertes} ouverte${ouvertes !== 1 ? "s" : ""}` },
          { label: "Candidatures",    value: totalCandidatures,    color: "#EE813D", icon: Users,       sub: "au total"   },
          { label: "En validation",   value: enAttente,            color: "#7C3AED", icon: Clock,       sub: "en attente" },
          { label: "Offres fermées",  value: fermees,              color: "#D64045", icon: CheckCircle, sub: "terminé"    },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 16, padding: isMobile ? "14px 16px" : "20px 24px", boxShadow: "0 1px 6px rgba(16,64,107,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#5A7A96", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#B0C4D4", marginTop: 1 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 1px 6px rgba(16,64,107,0.05)", marginBottom: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Évolution</div>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Candidatures reçues</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -40, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2284C0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2284C0" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,64,107,0.05)" />
              <XAxis dataKey="semaine" tick={{ fontSize: 10, fill: "#B0C4D4" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#B0C4D4" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="candidatures" stroke="#2284C0" strokeWidth={2} fill="url(#areaGrad)" name="Candidatures" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <button
          onClick={() => setChartsExpanded(e => !e)}
          style={{ width: "100%", padding: "11px", borderRadius: 12, background: "white", border: "1px solid rgba(16,64,107,0.1)", color: "#5A7A96", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.18s", marginBottom: chartsExpanded ? 12 : 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,132,192,0.3)"; (e.currentTarget as HTMLElement).style.color = "#2284C0"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,64,107,0.1)"; (e.currentTarget as HTMLElement).style.color = "#5A7A96"; }}
        >
          {chartsExpanded ? <><ChevronUp size={15} /> Masquer les graphiques</> : <><ChevronDown size={15} /> Voir tous les graphiques</>}
        </button>

        {chartsExpanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 1px 6px rgba(16,64,107,0.05)" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Par offre</div>
                <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Candidatures par poste</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={offreBarData} margin={{ top: 4, right: 4, left: -40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,64,107,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#B0C4D4" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#B0C4D4" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="candidats" fill="#EE813D" radius={[6, 6, 0, 0]} name="Candidats" maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 1px 6px rgba(16,64,107,0.05)" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Répartition</div>
                <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Statut des offres</div>
              </div>
              {statutPieData.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "#B0C4D4", fontSize: 13 }}>Aucune offre</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={statutPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                        {statutPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    {statutPieData.map(d => (
                      <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                          <span style={{ fontSize: 12, color: "#5A7A96" }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Offers section ────────────────────────────────────────────── */}
      <div>

        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 4 }}>Mes offres</div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "#0D2137" }}>
              {filteredOffres.length} offre{filteredOffres.length !== 1 ? "s" : ""}
              {hasFilters && <span style={{ fontSize: 13, color: "#5A7A96", fontWeight: 500, marginLeft: 8 }}>filtrées</span>}
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {!selectMode ? (
              <>
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${filtersOpen || hasFilters ? "rgba(34,132,192,0.35)" : "rgba(16,64,107,0.12)"}`, background: filtersOpen || hasFilters ? "rgba(34,132,192,0.06)" : "white", color: filtersOpen || hasFilters ? "#2284C0" : "#5A7A96", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                >
                  <Filter size={13} /> Filtrer
                  {hasFilters && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EE813D", display: "inline-block" }} />}
                </button>
                <button
                  onClick={() => setSelectMode(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(16,64,107,0.12)", background: "white", color: "#5A7A96", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                >
                  <Archive size={13} /> Archiver
                </button>
              </>
            ) : (
              /* Selection mode toolbar */
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 14px", borderRadius: 12, background: "rgba(34,132,192,0.06)", border: "1px solid rgba(34,132,192,0.2)" }}>
                <span style={{ fontSize: 13, color: "#2284C0", fontWeight: 600 }}>
                  {selected.size} sélectionnée{selected.size !== 1 ? "s" : ""}
                </span>
                <button onClick={selectAll} style={{ fontSize: 12, color: "#2284C0", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "2px 6px" }}>
                  Tout
                </button>
                <button onClick={deselectAll} style={{ fontSize: 12, color: "#5A7A96", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "2px 6px" }}>
                  Aucun
                </button>
                <button
                  onClick={archiveSelected}
                  disabled={selected.size === 0}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: selected.size > 0 ? "#10406B" : "rgba(16,64,107,0.1)", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: selected.size > 0 ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", opacity: selected.size === 0 ? 0.5 : 1 }}
                >
                  <Archive size={12} /> Archiver
                </button>
                <button onClick={exitSelectMode} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(16,64,107,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={13} color="#5A7A96" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter bar */}
        {filtersOpen && (
          <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(16,64,107,0.05)" }}>

            {/* Search */}
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <Search size={13} color="#B0C4D4" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une offre…"
                style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 9, border: "1.5px solid rgba(16,64,107,0.12)", outline: "none", fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif", background: "#FAFAF8", boxSizing: "border-box" }}
                onFocus={e  => (e.target.style.borderColor = "#2284C0")}
                onBlur={e   => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
              />
            </div>

            {/* Statut filter */}
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(16,64,107,0.12)", outline: "none", fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif", background: "#FAFAF8", cursor: "pointer" }}
            >
              <option value="">Tous les statuts</option>
              {STATUT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Contrat filter */}
            <select
              value={filterContrat}
              onChange={e => setFilterContrat(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(16,64,107,0.12)", outline: "none", fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif", background: "#FAFAF8", cursor: "pointer" }}
            >
              <option value="">Tous les contrats</option>
              {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {hasFilters && (
              <button onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 12px", borderRadius: 9, background: "rgba(214,64,69,0.06)", border: "1px solid rgba(214,64,69,0.15)", color: "#D64045", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                <X size={12} /> Réinitialiser
              </button>
            )}
          </div>
        )}

        {/* Active offers grid */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <span style={{ color: "#5A7A96" }}>Chargement…</span>
          </div>
        ) : activeOffres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#10406B", marginBottom: 8 }}>Aucune offre publiée</div>
            <div style={{ color: "#5A7A96", fontSize: 14, marginBottom: 24 }}>Créez votre première offre pour commencer à recruter</div>
            <button onClick={() => setModal({ type: "create" })} style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #EE813D, #d4691f)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Plus size={14} /> Créer une offre
            </button>
          </div>
        ) : filteredOffres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#10406B", marginBottom: 6 }}>Aucune offre ne correspond</div>
            <div style={{ color: "#5A7A96", fontSize: 14, marginBottom: 16 }}>Essayez de modifier vos filtres</div>
            <button onClick={resetFilters} style={{ padding: "9px 18px", borderRadius: 10, background: "rgba(34,132,192,0.08)", border: "1px solid rgba(34,132,192,0.2)", color: "#2284C0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filteredOffres.map(o => (
              <OfferCard
                key={o.id}
                offre={o}
                onClick={() => setModal({ type: "detail", offre: o })}
                selectable={selectMode}
                selected={selected.has(o.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )}

        {/* ── Archived offers section ──────────────────────────────────── */}
        {archivedOffres.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <button
              onClick={() => setArchivedOpen(o => !o)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 14, border: "1px solid rgba(16,64,107,0.1)", background: "white", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: archivedOpen ? 14 : 0, transition: "all 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(16,64,107,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(16,64,107,0.1)")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(16,64,107,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Archive size={15} color="#5A7A96" />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0D2137" }}>Offres archivées</div>
                  <div style={{ fontSize: 12, color: "#5A7A96" }}>{archivedOffres.length} offre{archivedOffres.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              {archivedOpen ? <ChevronUp size={16} color="#5A7A96" /> : <ChevronDown size={16} color="#5A7A96" />}
            </button>

            {archivedOpen && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {archivedOffres.map(o => (
                  <div key={o.id} style={{ position: "relative" }}>
                    {/* Greyed overlay */}
                    <div style={{ opacity: 0.5, pointerEvents: "none" }}>
                      <OfferCard offre={o} onClick={() => {}} />
                    </div>
                    {/* Unarchive button */}
                    <button
                      onClick={() => unarchive([o.id])}
                      style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: "white", border: "1px solid rgba(16,64,107,0.15)", color: "#5A7A96", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 2px 8px rgba(16,64,107,0.1)", zIndex: 2 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2284C0"; (e.currentTarget as HTMLElement).style.color = "#2284C0"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,64,107,0.15)"; (e.currentTarget as HTMLElement).style.color = "#5A7A96"; }}
                    >
                      <ArchiveRestore size={11} /> Désarchiver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}