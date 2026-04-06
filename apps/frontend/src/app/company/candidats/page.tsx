"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, Filter, Users, Briefcase, MapPin,
  ChevronRight, X, Loader2, ArrowUpDown,
  Eye, CheckCircle, XCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { candidaturesApi, offresApi, type Candidature, type Offre } from "@/lib/api";
import toast from "react-hot-toast";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  EN_ATTENTE: { label:"En attente", bg:"rgba(176,196,212,0.15)", color:"#5A7A96"  },
  VUE:        { label:"Vue",        bg:"rgba(34,132,192,0.1)",   color:"#2284C0"  },
  ENTRETIEN:  { label:"Entretien",  bg:"rgba(124,58,237,0.1)",   color:"#7C3AED"  },
  ACCEPTE:    { label:"Accepté",    bg:"rgba(26,158,111,0.1)",   color:"#1A9E6F"  },
  REFUSE:     { label:"Refusé",     bg:"rgba(214,64,69,0.1)",    color:"#D64045"  },
};

function getInitials(c: Candidature) {
  const p = c.candidat?.prenom?.[0] ?? "";
  const n = c.candidat?.nom?.[0]    ?? "";
  return `${p}${n}`.toUpperCase() || "??";
}

function getGradient(i: number) {
  const gradients = [
    "linear-gradient(135deg, #EE813D, #2284C0)",
    "linear-gradient(135deg, #2284C0, #7C3AED)",
    "linear-gradient(135deg, #1A9E6F, #2284C0)",
    "linear-gradient(135deg, #10406B, #EE813D)",
    "linear-gradient(135deg, #7C3AED, #1A9E6F)",
  ];
  return gradients[i % gradients.length];
}

// ── Inner component (uses useSearchParams) ────────────────────────────────────
function CandidatsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const qc           = useQueryClient();

  const offreIdParam = searchParams.get("offreId");

  const [selectedOffre, setSelectedOffre] = useState<string>(offreIdParam ?? "all");
  const [searchText,    setSearchText]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [sortBy,        setSortBy]        = useState<"date"|"name"|"status">("date");

  // Sync URL param on mount
  useEffect(() => {
    if (offreIdParam) setSelectedOffre(offreIdParam);
  }, [offreIdParam]);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: allCandidatures = [], isLoading: loadingAll } = useQuery({
    queryKey: ["candidatures-entreprise"],
    queryFn:  () => candidaturesApi.getByEntreprise().then(r => r.data),
  });

  const { data: offreCandidatures = [], isLoading: loadingOffre } = useQuery({
    queryKey: ["candidatures-offre", selectedOffre],
    queryFn:  () => candidaturesApi.getByOffre(+selectedOffre).then(r => r.data),
    enabled:  selectedOffre !== "all",
  });

  const { data: offres = [] } = useQuery({
    queryKey: ["mes-offres"],
    queryFn:  () => offresApi.mesOffres().then(r => r.data),
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      candidaturesApi.updateStatut(id, statut),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["candidatures-entreprise"] });
      qc.invalidateQueries({ queryKey:["candidatures-offre", selectedOffre] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  // ── Derived data ───────────────────────────────────────────────────────────
  const baseCandidatures = selectedOffre === "all" ? allCandidatures : offreCandidatures;
  const isLoading        = selectedOffre === "all" ? loadingAll : loadingOffre;

  const filtered = baseCandidatures
    .filter(c => {
      const name = `${c.candidat?.prenom ?? ""} ${c.candidat?.nom ?? ""}`.toLowerCase();
      const title = c.candidat?.titre?.toLowerCase() ?? "";
      const matchSearch = !searchText || name.includes(searchText.toLowerCase()) || title.includes(searchText.toLowerCase());
      const matchStatus = statusFilter === "all" || c.statut === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name")   return `${a.candidat?.prenom}${a.candidat?.nom}`.localeCompare(`${b.candidat?.prenom}${b.candidat?.nom}`);
      if (sortBy === "status") return a.statut.localeCompare(b.statut);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const resetFilters = () => {
    setSelectedOffre("all");
    setSearchText("");
    setStatusFilter("all");
    router.replace("/company/candidats");
  };

  const hasFilters = selectedOffre !== "all" || searchText || statusFilter !== "all";

  const selectedOffreName = offres.find(o => String(o.id) === selectedOffre)?.titre;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const statsData = [
    { label:"Total",     value: filtered.length,                                             color:"#2284C0" },
    { label:"En attente",value: filtered.filter(c => c.statut==="EN_ATTENTE").length,        color:"#5A7A96" },
    { label:"Entretiens",value: filtered.filter(c => c.statut==="ENTRETIEN").length,         color:"#7C3AED" },
    { label:"Acceptés",  value: filtered.filter(c => c.statut==="ACCEPTE").length,           color:"#1A9E6F" },
  ];

  return (
    <AppShell pageTitle="Candidats">

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Espace recruteur</div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em", marginBottom:4 }}>Candidats</h1>
        <p style={{ color:"#5A7A96", fontSize:15 }}>
          {selectedOffreName
            ? <>Candidats pour <strong style={{ color:"#10406B" }}>{selectedOffreName}</strong></>
            : "Tous les candidats de vos offres"
          }
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {statsData.map((s, i) => (
          <div key={i} style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:14, padding:"16px 20px", boxShadow:"0 1px 4px rgba(16,64,107,0.05)", display:"flex", alignItems:"center", gap:12 }}>
            <div className="font-display" style={{ fontSize:28, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:"16px 20px", marginBottom:20, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", boxShadow:"0 1px 4px rgba(16,64,107,0.05)" }}>

        {/* Search */}
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <Search size={14} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Rechercher un candidat…"
            style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:10, border:"1.5px solid rgba(16,64,107,0.12)", outline:"none", fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"#FAFAF8", boxSizing:"border-box" }}
            onFocus={e  => (e.target.style.borderColor="#2284C0")}
            onBlur={e   => (e.target.style.borderColor="rgba(16,64,107,0.12)")}
          />
        </div>

        {/* Offer filter */}
        <div style={{ position:"relative" }}>
          <Briefcase size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
          <select
            value={selectedOffre}
            onChange={e => {
              setSelectedOffre(e.target.value);
              if (e.target.value === "all") {
                router.replace("/company/candidats");
              } else {
                router.replace(`/company/candidats?offreId=${e.target.value}`);
              }
            }}
            style={{ padding:"9px 12px 9px 32px", borderRadius:10, border:"1.5px solid rgba(16,64,107,0.12)", outline:"none", fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"#FAFAF8", cursor:"pointer", minWidth:200 }}
          >
            <option value="all">Toutes les offres</option>
            {offres.map(o => (
              <option key={o.id} value={String(o.id)}>{o.titre}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid rgba(16,64,107,0.12)", outline:"none", fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"#FAFAF8", cursor:"pointer" }}
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUT_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Sort */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <ArrowUpDown size={13} color="#B0C4D4"/>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid rgba(16,64,107,0.12)", outline:"none", fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"#FAFAF8", cursor:"pointer" }}
          >
            <option value="date">Plus récents</option>
            <option value="name">Nom A–Z</option>
            <option value="status">Statut</option>
          </select>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button onClick={resetFilters} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, background:"rgba(214,64,69,0.06)", border:"1px solid rgba(214,64,69,0.15)", color:"#D64045", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
            <X size={12}/> Réinitialiser
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ fontSize:13, color:"#5A7A96", marginBottom:16, fontWeight:500 }}>
        <span style={{ color:"#10406B", fontWeight:700 }}>{filtered.length}</span> candidat{filtered.length!==1?"s":""} trouvé{filtered.length!==1?"s":""}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, gap:12 }}>
          <Loader2 size={28} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
          <span style={{ color:"#5A7A96" }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 0", background:"white", borderRadius:20, border:"1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>👥</div>
          <div className="font-display" style={{ fontSize:22, fontWeight:700, color:"#10406B", marginBottom:8 }}>Aucun candidat trouvé</div>
          <div style={{ color:"#5A7A96", fontSize:14 }}>
            {hasFilters ? "Essayez de modifier vos filtres" : "Aucun candidat n'a encore postulé à vos offres"}
          </div>
        </div>
      ) : (
        <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, overflow:"hidden", boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>
          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1.5fr 1fr 1fr auto", gap:16, padding:"12px 20px", background:"#F7F8FA", borderBottom:"1px solid rgba(16,64,107,0.07)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>
            <div>Candidat</div>
            <div>Poste postulé</div>
            <div>Compétences</div>
            <div>Date</div>
            <div>Statut</div>
            <div></div>
          </div>

          {/* Rows */}
          {filtered.map((c, i) => {
            const sc   = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG.EN_ATTENTE;
            const name = `${c.candidat?.prenom ?? ""} ${c.candidat?.nom ?? ""}`.trim() || "Candidat";
            const skills = c.candidat?.competences?.slice(0,3) ?? [];

            return (
              <div
                key={c.id}
                onClick={() => {
                  // Build back URL with current filters
                  const params = new URLSearchParams();
                  if (selectedOffre !== "all") params.set("offreId", selectedOffre);
                  if (searchText)              params.set("search",  searchText);
                  if (statusFilter !== "all")  params.set("status",  statusFilter);
                  const backUrl = `/company/candidats${params.toString() ? `?${params}` : ""}`;
                  router.push(`/company/candidats/${c.id}?back=${encodeURIComponent(backUrl)}`);
                }}
                style={{
                  display:"grid", gridTemplateColumns:"2fr 2fr 1.5fr 1fr 1fr auto",
                  gap:16, padding:"14px 20px", alignItems:"center",
                  borderBottom: i < filtered.length-1 ? "1px solid rgba(16,64,107,0.05)" : "none",
                  cursor:"pointer", transition:"background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background="rgba(34,132,192,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
              >
                {/* Candidat */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0, background:getGradient(i), display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"white" }}>
                    {getInitials(c)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0D2137" }}>{name}</div>
                    {c.candidat?.titre && <div style={{ fontSize:11, color:"#5A7A96", marginTop:1 }}>{c.candidat.titre}</div>}
                    {c.candidat?.localisation && (
                      <div style={{ fontSize:11, color:"#B0C4D4", display:"flex", alignItems:"center", gap:3, marginTop:1 }}>
                        <MapPin size={9}/>{c.candidat.localisation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Offre */}
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0D2137", marginBottom:2 }}>{c.offre?.titre ?? "—"}</div>
                  {c.offre?.type_contrat && (
                    <span style={{ fontSize:10, fontWeight:700, background:"rgba(34,132,192,0.08)", color:"#2284C0", padding:"2px 8px", borderRadius:6 }}>{c.offre.type_contrat}</span>
                  )}
                </div>

                {/* Skills */}
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {skills.length > 0
                    ? skills.map(s => (
                        <span key={s.competenceId} style={{ background:"#F0F4F8", color:"#5A7A96", fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:6 }}>
                          {s.competence.nom}
                        </span>
                      ))
                    : <span style={{ color:"#B0C4D4", fontSize:11 }}>—</span>
                  }
                </div>

                {/* Date */}
                <div style={{ fontSize:12, color:"#5A7A96" }}>
                  {new Date(c.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short" })}
                </div>

                {/* Status */}
                <div>
                  <span style={{ background:sc.bg, color:sc.color, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:99, whiteSpace:"nowrap" }}>
                    {sc.label}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight size={16} color="#B0C4D4"/>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

// ── Page export with Suspense ──────────────────────────────────────────────────
export default function CandidatsPage() {
  return (
    <Suspense fallback={
      <AppShell pageTitle="Candidats">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400, gap:12 }}>
          <Loader2 size={28} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
          <span style={{ color:"#5A7A96" }}>Chargement…</span>
        </div>
      </AppShell>
    }>
      <CandidatsContent/>
    </Suspense>
  );
}