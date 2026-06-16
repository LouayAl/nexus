// frontend/src/app/admin/offres/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Search, Filter, Loader2, Building2, MapPin, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { adminApi, type Offre } from "@/lib/api";
import { useAdminEntreprises } from "../_hooks/useAdminData";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUTS = [
  { value: "",           label: "Tous les statuts" },
  { value: "EN_ATTENTE", label: "En attente"       },
  { value: "OUVERTE",    label: "Ouverte"           },
  { value: "FERMEE",     label: "Fermée"            },
];

const STATUT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  OUVERTE:    { color: "#1A9E6F", bg: "rgba(26,158,111,0.1)",  label: "Ouverte"    },
  EN_ATTENTE: { color: "#EE813D", bg: "rgba(238,129,61,0.1)",  label: "En attente" },
  FERMEE:     { color: "#D64045", bg: "rgba(214,64,69,0.1)",   label: "Fermée"     },
};

const selSx: React.CSSProperties = {
  padding: "9px 14px", borderRadius: 10,
  border: "1.5px solid rgba(16,64,107,0.12)", outline: "none",
  fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif",
  background: "white", cursor: "pointer",
};

export default function AdminOffresPage() {
  const qc = useQueryClient();
  const [search,       setSearch]       = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterEnt,    setFilterEnt]    = useState("");
  const [expanded,     setExpanded]     = useState<number | null>(null);

  // Load all offers from all entreprises
  const { data: entreprises = [], isLoading: loadingEnt } = useAdminEntreprises(true);
  const { data: pending = [],     isLoading: loadingPending } = useQuery({
    queryKey: ["admin-pending"],
    queryFn:  () => adminApi.getPending().then(r => r.data),
  });

  // Collect all offers from entreprises (includes statut info)
  // Plus pending (EN_ATTENTE) — merge and deduplicate
  const allFromEnt: Offre[] = entreprises.flatMap(e =>
    e.offres.map(o => ({ ...o, entreprise: { id: e.id, nom: e.nom, logoUrl: e.logoUrl ?? null, localisation: e.localisation ?? null } }) as any)
  );
  const pendingIds = new Set(pending.map(o => o.id));
  const merged: Offre[] = [
    ...pending,
    ...allFromEnt.filter(o => !pendingIds.has(o.id)),
  ];

  const filtered = merged.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.titre.toLowerCase().includes(q) || o.entreprise?.nom?.toLowerCase().includes(q);
    const matchStatut = !filterStatut || o.statut === filterStatut;
    const matchEnt    = !filterEnt    || String(o.entreprise?.id) === filterEnt;
    return matchSearch && matchStatut && matchEnt;
  });

  const approve = useMutation({
    mutationFn: (id: number) => adminApi.approveOffre(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pending"] }); qc.invalidateQueries({ queryKey: ["admin-entreprises"] }); toast.success("Offre approuvée"); },
    onError:   () => toast.error("Erreur"),
  });
  const reject = useMutation({
    mutationFn: (id: number) => adminApi.rejectOffre(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pending"] }); qc.invalidateQueries({ queryKey: ["admin-entreprises"] }); toast.success("Offre refusée"); },
    onError:   () => toast.error("Erreur"),
  });

  const isLoading = loadingEnt || loadingPending;

  return (
    <AppShell pageTitle="Offres">
      <style>{`
        .off-row { background:white; border:1px solid rgba(16,64,107,0.08); border-radius:16px; overflow:hidden; margin-bottom:10px; transition:box-shadow 0.2s; }
        .off-row:hover { box-shadow:0 4px 20px rgba(16,64,107,0.08); }
        .off-head { display:flex; align-items:center; gap:14px; padding:16px 20px; }
        .off-body { padding:0 20px 20px; border-top:1px solid rgba(16,64,107,0.06); }
        .tag { display:inline-block; font-size:11px; font-weight:600; padding:3px 10px; border-radius:8px; background:rgba(16,64,107,0.06); color:#5A7A96; }
        .filters { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        @media(max-width:600px) { .off-head { flex-wrap:wrap; } }
      `}</style>

      {/* Back + title */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5A7A96", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}>
          <ArrowLeft size={15} /> Tableau de bord
        </Link>
        <h1 className="font-display" style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Toutes les offres
        </h1>
        <p style={{ color: "#5A7A96", fontSize: 14 }}>{isLoading ? "…" : `${filtered.length} offre${filtered.length !== 1 ? "s" : ""}`}</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une offre…"
            style={{ ...selSx, width: "100%", paddingLeft: 36, boxSizing: "border-box" }}
          />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={selSx}>
          {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterEnt} onChange={e => setFilterEnt(e.target.value)} style={selSx}>
          <option value="">Toutes les entreprises</option>
          {entreprises.map(e => <option key={e.id} value={String(e.id)}>{e.nom}</option>)}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 20, border: "1px solid rgba(16,64,107,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#10406B" }}>Aucune offre trouvée</div>
        </div>
      ) : (
        filtered.map(o => {
          const sc = STATUT_STYLE[o.statut] ?? STATUT_STYLE.FERMEE;
          const isOpen = expanded === o.id;
          return (
            <div key={o.id} className="off-row">
              <div style={{ height: 3, background: o.statut === "EN_ATTENTE" ? "linear-gradient(90deg,#EE813D,#f5a761)" : o.statut === "OUVERTE" ? "linear-gradient(90deg,#1A9E6F,#34d399)" : "linear-gradient(90deg,#D64045,#f87171)" }} />
              <div className="off-head">
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#0D2137" }}>{o.titre}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#5A7A96" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Building2 size={10} />{o.entreprise?.nom}</span>
                    {o.localisation && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} />{o.localisation}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{new Date(o.createdAt).toLocaleDateString("fr-FR")}</span>
                    <span className="tag">{o.type_contrat}</span>
                    <span style={{ color: "#B0C4D4" }}>👥 {o._count?.candidatures ?? 0} candidature{(o._count?.candidatures ?? 0) !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  {o.statut === "EN_ATTENTE" && (
                    <>
                      <button onClick={() => reject.mutate(o.id)} disabled={reject.isPending}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 9, background: "rgba(214,64,69,0.06)", border: "1px solid rgba(214,64,69,0.2)", color: "#D64045", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        <XCircle size={13} /> Refuser
                      </button>
                      <button onClick={() => approve.mutate(o.id)} disabled={approve.isPending}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 9, background: "linear-gradient(135deg,#1A9E6F,#0d7a54)", border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 3px 10px rgba(26,158,111,0.3)" }}>
                        <CheckCircle size={13} /> Approuver
                      </button>
                    </>
                  )}
                  {o.entreprise?.id && (
                    <Link href={`/admin/entreprises/${o.entreprise.id}/offres`}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 9, background: "rgba(34,132,192,0.08)", border: "1px solid rgba(34,132,192,0.15)", color: "#2284C0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      Gérer
                    </Link>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="off-body">
                  <div style={{ paddingTop: 16 }}>
                    {o.competences && o.competences.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        {o.competences.map((c: any) => (
                          <span key={c.competence?.id ?? c.competenceId} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "rgba(34,132,192,0.08)", color: "#2284C0" }}>
                            {c.competence?.nom ?? c.nom}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.75, whiteSpace: "pre-wrap", background: "#F7F8FA", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #2284C0" }}>
                      {o.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </AppShell>
  );
}