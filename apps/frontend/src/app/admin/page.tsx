"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle, XCircle, Building2, MapPin, Clock,
  Shield, Eye, Plus, ArrowRight, Loader2, X,
  Users, Briefcase, Globe, ChevronRight, Tag,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  adminApi, entreprisesApi,
  type Offre, type EntrepriseAdmin, type AdminCreateOffreDto,
} from "@/lib/api";
import toast from "react-hot-toast";

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, wide = false, children }: {
  title: string; onClose: () => void; wide?: boolean; children: React.ReactNode;
}) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24, pointerEvents:"none" }}>
        <div style={{
          background:"white", borderRadius:24, width:"100%",
          maxWidth: wide ? 720 : 560, maxHeight:"90vh",
          boxShadow:"0 32px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)",
          pointerEvents:"all", display:"flex", flexDirection:"column", overflow:"hidden",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 28px", borderBottom:"1px solid rgba(16,64,107,0.07)", flexShrink:0 }}>
            <h3 className="font-display" style={{ fontSize:20, fontWeight:800, color:"#0D2137" }}>{title}</h3>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={15} color="#5A7A96"/>
            </button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>{label}</label>
      {children}
    </div>
  );
}

const iSx: React.CSSProperties = {
  width:"100%", padding:"11px 14px", borderRadius:10,
  border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
  fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
  background:"#FAFAF8", boxSizing:"border-box",
};

// ── Admin Create Offer Modal ───────────────────────────────────────────────────
function AdminCreateOfferModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titre:"", description:"", type_contrat:"CDI",
    niveau_experience:"", localisation:"",
    salaire_min: undefined as number|undefined,
    salaire_max: undefined as number|undefined,
    competences_str:"",
  });

  const { data: entreprises = [] } = useQuery({
    queryKey: ["admin-entreprises"],
    queryFn:  () => adminApi.getAllEntreprises().then(r => r.data),
  });

  const selectedEnt = entreprises.find(e => e.id === selectedEntrepriseId);

  const mut = useMutation({
    mutationFn: () => {
      if (!selectedEntrepriseId) throw new Error("Sélectionnez une entreprise");
      const payload: AdminCreateOffreDto = {
        entrepriseId:      selectedEntrepriseId,
        titre:             form.titre,
        description:       form.description,
        type_contrat:      form.type_contrat,
        niveau_experience: form.niveau_experience || undefined,
        localisation:      form.localisation      || undefined,
        salaire_min:       form.salaire_min        || undefined,
        salaire_max:       form.salaire_max        || undefined,
        competences:       form.competences_str.split(",").map(s => s.trim()).filter(Boolean),
      };
      return adminApi.createForEntreprise(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["admin-pending"] });
      toast.success("Offre créée avec succès !");
      onClose();
    },
    onError: (err: any) => toast.error(err?.message ?? "Erreur"),
  });

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));
  const tags = form.competences_str.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <Modal title="Créer une offre (Admin)" onClose={onClose} wide>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>

        {/* Step 1 — Pick entreprise */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0D2137", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:22, height:22, borderRadius:"50%", background:"#10406B", color:"white", fontSize:11, fontWeight:800, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>1</span>
            Sélectionner l'entreprise
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8, maxHeight:200, overflowY:"auto", padding:4 }}>
            {entreprises.map(e => (
              <button key={e.id} type="button" onClick={() => setSelectedEntrepriseId(e.id)} style={{
                padding:"12px 14px", borderRadius:12, textAlign:"left", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
                background: selectedEntrepriseId===e.id ? "rgba(16,64,107,0.06)" : "#F7F8FA",
                border:`2px solid ${selectedEntrepriseId===e.id ? "#10406B" : "rgba(16,64,107,0.1)"}`,
              }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg, #10406B, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"white", marginBottom:8, fontFamily:"'Fraunces',serif" }}>
                  {e.nom.charAt(0)}
                </div>
                <div style={{ fontWeight:700, fontSize:12, color:selectedEntrepriseId===e.id?"#10406B":"#0D2137", marginBottom:2 }}>{e.nom}</div>
                {e.secteur && <div style={{ fontSize:10, color:"#5A7A96" }}>{e.secteur}</div>}
                <div style={{ fontSize:10, color:"#B0C4D4", marginTop:2 }}>{e._count.offres} offre{e._count.offres!==1?"s":""}</div>
              </button>
            ))}
          </div>

          {/* Selected entreprise preview */}
          {selectedEnt && (
            <div style={{ marginTop:12, padding:"12px 16px", background:"rgba(16,64,107,0.04)", borderRadius:12, border:"1px solid rgba(16,64,107,0.1)", display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg, #10406B, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>
                {selectedEnt.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"#0D2137" }}>{selectedEnt.nom}</div>
                <div style={{ fontSize:12, color:"#5A7A96", display:"flex", gap:10, flexWrap:"wrap" }}>
                  {selectedEnt.secteur    && <span>{selectedEnt.secteur}</span>}
                  {selectedEnt.localisation && <span>· {selectedEnt.localisation}</span>}
                  <span>· {selectedEnt.utilisateur.email}</span>
                </div>
              </div>
              <CheckCircle size={16} color="#1A9E6F" style={{ marginLeft:"auto", flexShrink:0 }}/>
            </div>
          )}
        </div>

        <div style={{ borderTop:"1px solid rgba(16,64,107,0.07)", paddingTop:20, marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0D2137", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:22, height:22, borderRadius:"50%", background:"#10406B", color:"white", fontSize:11, fontWeight:800, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>2</span>
            Détails de l'offre
          </div>
        </div>

        <Field label="Titre du poste">
          <input style={iSx} value={form.titre} onChange={set("titre")} placeholder="Ex: Senior React Developer" required/>
        </Field>

        <div style={{ display:"flex", gap:12 }}>
          <Field label="Type de contrat">
            <select style={iSx} value={form.type_contrat} onChange={set("type_contrat")}>
              {["CDI","CDD","Freelance","Stage","Alternance"].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Niveau d'expérience">
            <select style={iSx} value={form.niveau_experience} onChange={set("niveau_experience")}>
              <option value="">— Sélectionner —</option>
              {["Junior","Confirmé","Senior","Expert"].map(n => <option key={n}>{n}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Localisation">
          <input style={iSx} value={form.localisation} onChange={set("localisation")} placeholder="Paris · Remote"/>
        </Field>

        <div style={{ display:"flex", gap:12 }}>
          <Field label="Salaire min ( MAD/an)">
            <input type="number" style={iSx} value={form.salaire_min??""} onChange={e => setForm(f => ({ ...f, salaire_min: e.target.value ? +e.target.value : undefined }))} placeholder="45000"/>
          </Field>
          <Field label="Salaire max ( MAD/an)">
            <input type="number" style={iSx} value={form.salaire_max??""} onChange={e => setForm(f => ({ ...f, salaire_max: e.target.value ? +e.target.value : undefined }))} placeholder="65000"/>
          </Field>
        </div>

        <Field label="Compétences (séparées par virgule)">
          <input style={iSx} value={form.competences_str} onChange={set("competences_str")} placeholder="React, TypeScript, Node.js…"/>
          {tags.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
              {tags.map(t => <span key={t} style={{ background:"rgba(34,132,192,0.1)", color:"#2284C0", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:8 }}>{t}</span>)}
            </div>
          )}
        </Field>

        <Field label="Description">
          <textarea style={{ ...iSx, minHeight:100, resize:"vertical" } as any} value={form.description} onChange={set("description")} placeholder="Décrivez le poste…" required/>
        </Field>

        <button type="submit" disabled={mut.isPending || !selectedEntrepriseId} style={{
          width:"100%", padding:"13px",
          background: !selectedEntrepriseId ? "rgba(16,64,107,0.2)" : mut.isPending ? "rgba(16,64,107,0.4)" : "linear-gradient(135deg, #10406B, #2284C0)",
          border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:700,
          cursor: !selectedEntrepriseId || mut.isPending ? "not-allowed" : "pointer",
          fontFamily:"'DM Sans',sans-serif",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          boxShadow: selectedEntrepriseId ? "0 4px 20px rgba(16,64,107,0.25)" : "none",
        }}>
          {mut.isPending
            ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> Création…</>
            : !selectedEntrepriseId
            ? "Sélectionnez d'abord une entreprise"
            : <><Plus size={14}/> Créer l'offre pour {selectedEnt?.nom}</>
          }
        </button>
      </form>
    </Modal>
  );
}

// ── Entreprise Detail Modal ────────────────────────────────────────────────────
function EntrepriseDetailModal({ entreprise, onClose }: { entreprise: EntrepriseAdmin; onClose: () => void }) {
  const ouvertes = entreprise.offres.filter(o => o.statut === "OUVERTE").length;
  const total    = entreprise.offres.reduce((s, o) => s + o._count.candidatures, 0);

  return (
    <Modal title="Profil entreprise" onClose={onClose}>
      {/* Header */}
      <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:24 }}>
        <div style={{ width:64, height:64, borderRadius:16, background:"linear-gradient(135deg, #10406B, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>
          {entreprise.nom.charAt(0)}
        </div>
        <div>
          <div className="font-display" style={{ fontSize:22, fontWeight:800, color:"#0D2137", marginBottom:4 }}>{entreprise.nom}</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {entreprise.secteur     && <span style={{ fontSize:12, color:"#2284C0", fontWeight:600 }}>{entreprise.secteur}</span>}
            {entreprise.localisation && <span style={{ fontSize:12, color:"#5A7A96", display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{entreprise.localisation}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        {[
          { label:"Total offres",  value:entreprise._count.offres, color:"#2284C0" },
          { label:"Ouvertes",      value:ouvertes,                 color:"#1A9E6F" },
          { label:"Candidatures",  value:total,                    color:"#EE813D" },
        ].map(s => (
          <div key={s.label} style={{ background:"#F7F8FA", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(16,64,107,0.07)", textAlign:"center" }}>
            <div className="font-display" style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#5A7A96", marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ background:"#F7F8FA", borderRadius:14, padding:"16px 18px", marginBottom:20 }}>
        {[
          { label:"Email",        value:entreprise.utilisateur.email },
          { label:"Secteur",      value:entreprise.secteur      ?? "—" },
          { label:"Localisation", value:entreprise.localisation ?? "—" },
          { label:"Site web",     value:entreprise.siteWeb      ?? "—" },
          { label:"Membre depuis",value:new Date(entreprise.utilisateur.createdAt).toLocaleDateString("fr-FR") },
        ].map(({ label, value }) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(16,64,107,0.05)" }}>
            <span style={{ fontSize:12, color:"#5A7A96" }}>{label}</span>
            <span style={{ fontSize:12, fontWeight:600, color:"#0D2137" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      {entreprise.description && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:8 }}>Description</div>
          <p style={{ fontSize:13, color:"#3D5A73", lineHeight:1.7, margin:0 }}>{entreprise.description}</p>
        </div>
      )}

      {/* Offers list */}
      {entreprise.offres.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>Offres publiées</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {entreprise.offres.map(o => {
              const sc = o.statut==="OUVERTE"    ? { color:"#1A9E6F", bg:"rgba(26,158,111,0.1)",  label:"Ouverte"    }
                       : o.statut==="EN_ATTENTE" ? { color:"#EE813D", bg:"rgba(238,129,61,0.1)",  label:"En attente" }
                       : { color:"#D64045", bg:"rgba(214,64,69,0.1)", label:"Fermée" };
              return (
                <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"#F7F8FA", borderRadius:10, border:"1px solid rgba(16,64,107,0.06)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0D2137" }}>{o.titre}</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:3 }}><Users size={10}/>{o._count.candidatures}</span>
                    <span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
type AdminTab = "offers" | "entreprises";

export default function AdminPage() {
  const qc = useQueryClient();
  const [tab,              setTab]              = useState<AdminTab>("offers");
  const [expanded,         setExpanded]         = useState<number | null>(null);
  const [showCreateModal,  setShowCreateModal]  = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<EntrepriseAdmin | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: pending = [], isLoading: loadingOffers } = useQuery({
    queryKey: ["admin-pending"],
    queryFn:  () => adminApi.getPending().then(r => r.data),
  });

  const { data: entreprises = [], isLoading: loadingEntreprises } = useQuery({
    queryKey: ["admin-entreprises"],
    queryFn:  () => adminApi.getAllEntreprises().then(r => r.data),
    enabled:  tab === "entreprises",
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const approve = useMutation({
    mutationFn: (id: number) => adminApi.approveOffre(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey:["admin-pending"] }); toast.success("Offre approuvée !"); },
    onError:    () => toast.error("Erreur"),
  });

  const reject = useMutation({
    mutationFn: (id: number) => adminApi.rejectOffre(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey:["admin-pending"] }); toast.success("Offre refusée."); },
    onError:    () => toast.error("Erreur"),
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const totalEntreprises  = entreprises.length;
  const totalCandidatures = entreprises.reduce((s, e) => s + e.offres.reduce((ss, o) => ss + o._count.candidatures, 0), 0);

  return (
    <AppShell pageTitle="Administration">
      {/* Modals */}
      {showCreateModal   && <AdminCreateOfferModal onClose={() => setShowCreateModal(false)}/>}
      {selectedEntreprise && <EntrepriseDetailModal entreprise={selectedEntreprise} onClose={() => setSelectedEntreprise(null)}/>}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"rgba(214,64,69,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Shield size={15} color="#D64045"/>
            </div>
            <span style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#D64045" }}>Accès restreint</span>
          </div>
          <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em", marginBottom:4 }}>Panneau Administrateur</h1>
          <p style={{ color:"#5A7A96", fontSize:15 }}>Modérez les offres et gérez les entreprises de la plateforme</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"12px 22px", borderRadius:12,
          background:"linear-gradient(135deg, #10406B, #2284C0)",
          border:"none", color:"white", fontSize:14, fontWeight:700,
          cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
          boxShadow:"0 4px 20px rgba(16,64,107,0.25)",
        }}>
          <Plus size={15}/> Créer une offre
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        {[
          { value:pending.length,        label:"En attente",    color:"#EE813D", icon:Clock,       bg:"rgba(238,129,61,0.1)"  },
          { value:entreprises.length||"—",label:"Entreprises",  color:"#2284C0", icon:Building2,   bg:"rgba(34,132,192,0.1)"  },
          { value:totalCandidatures||"—", label:"Candidatures", color:"#1A9E6F", icon:Users,       bg:"rgba(26,158,111,0.1)"  },
          { value:"Admin",               label:"Niveau accès",  color:"#D64045", icon:Shield,      bg:"rgba(214,64,69,0.1)"   },
        ].map((s, i) => (
          <div key={i} style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:"20px 24px", boxShadow:"0 1px 6px rgba(16,64,107,0.05)", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <s.icon size={20} color={s.color}/>
            </div>
            <div>
              <div className="font-display" style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#5A7A96", marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:"#F7F8FA", borderRadius:12, padding:4, marginBottom:24, width:"fit-content" }}>
        {([["offers","Offres en attente"],["entreprises","Entreprises"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:"9px 20px", borderRadius:9, border:"none", fontSize:13, fontWeight:600,
            cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
            background: tab===key ? "white" : "transparent",
            color:      tab===key ? "#10406B" : "#5A7A96",
            boxShadow:  tab===key ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
          }}>
            {label}
            {key==="offers" && pending.length > 0 && (
              <span style={{ marginLeft:6, background:"#EE813D", color:"white", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:99 }}>{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OFFERS TAB ── */}
      {tab === "offers" && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>
            Offres en attente de validation ({pending.length})
          </div>

          {loadingOffers ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12 }}>
              <Loader2 size={24} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
              <span style={{ color:"#5A7A96" }}>Chargement…</span>
            </div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0", background:"white", borderRadius:20, border:"1px solid rgba(16,64,107,0.08)" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
              <div className="font-display" style={{ fontSize:22, fontWeight:700, color:"#10406B", marginBottom:8 }}>Tout est à jour !</div>
              <div style={{ color:"#5A7A96", fontSize:14 }}>Aucune offre en attente de validation.</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {pending.map((offer: Offre, i: number) => (
                <div key={offer.id} style={{
                  background:"white", borderRadius:16,
                  border:"1px solid rgba(16,64,107,0.08)",
                  boxShadow:"0 2px 8px rgba(16,64,107,0.05)", overflow:"hidden",
                }}>
                  <div style={{ height:3, background:"linear-gradient(90deg, #EE813D, #2284C0)" }}/>
                  <div style={{ padding:"20px 24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
                      <div style={{ flex:1, minWidth:240 }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                          <div className="font-display" style={{ fontSize:16, fontWeight:700, color:"#0D2137" }}>{offer.titre}</div>
                          <span style={{ fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:99, background:"rgba(238,129,61,0.1)", color:"#EE813D" }}>⏳ En attente</span>
                        </div>
                        <div style={{ display:"flex", gap:16, color:"#5A7A96", fontSize:12, marginBottom:12, flexWrap:"wrap" }}>
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Building2 size={11}/>{offer.entreprise?.nom}</span>
                          {offer.localisation && <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/>{offer.localisation}</span>}
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={11}/>{new Date(offer.createdAt).toLocaleDateString("fr-FR")}</span>
                          <span>{offer.type_contrat}</span>
                          {offer.niveau_experience && <span>{offer.niveau_experience}</span>}
                        </div>
                        {/* Skills */}
                        {(offer.competences?.length ?? 0) > 0 && (
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {offer.competences!.map(c => (
                              <span key={c.competenceId} style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", color:"#5A7A96", fontSize:11, padding:"3px 10px", borderRadius:8 }}>
                                {c.competence.nom}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                        <div style={{ display:"flex", gap:8 }}>
                          <button
                            onClick={() => reject.mutate(offer.id)}
                            disabled={reject.isPending}
                            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, background:"rgba(214,64,69,0.06)", border:"1px solid rgba(214,64,69,0.2)", color:"#D64045", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}
                            onMouseEnter={e => (e.currentTarget.style.background="rgba(214,64,69,0.12)")}
                            onMouseLeave={e => (e.currentTarget.style.background="rgba(214,64,69,0.06)")}
                          >
                            <XCircle size={15}/> Refuser
                          </button>
                          <button
                            onClick={() => approve.mutate(offer.id)}
                            disabled={approve.isPending}
                            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg, #1A9E6F, #0d7a54)", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 12px rgba(26,158,111,0.3)" }}
                            onMouseEnter={e => (e.currentTarget.style.opacity="0.88")}
                            onMouseLeave={e => (e.currentTarget.style.opacity="1")}
                          >
                            <CheckCircle size={15}/> Approuver
                          </button>
                        </div>
                        <button onClick={() => setExpanded(expanded===offer.id ? null : offer.id)} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", color:"#5A7A96", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          <Eye size={13}/> {expanded===offer.id ? "Masquer" : "Aperçu"}
                        </button>
                      </div>
                    </div>

                    {/* Expandable description */}
                    {expanded===offer.id && (
                      <div style={{ marginTop:16, padding:"14px 16px", background:"#F7F8FA", borderRadius:10, fontSize:13, color:"#5A7A96", lineHeight:1.7, borderLeft:"3px solid #2284C0" }}>
                        <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#B0C4D4", marginBottom:6 }}>Description</div>
                        {offer.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ENTREPRISES TAB ── */}
      {tab === "entreprises" && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>
            Toutes les entreprises ({entreprises.length})
          </div>

          {loadingEntreprises ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12 }}>
              <Loader2 size={24} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
              <span style={{ color:"#5A7A96" }}>Chargement…</span>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:14 }}>
              {entreprises.map(e => {
                const ouvertes = e.offres.filter(o => o.statut === "OUVERTE").length;
                const totalC   = e.offres.reduce((s, o) => s + o._count.candidatures, 0);
                return (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEntreprise(e)}
                    style={{
                      background:"white", border:"1px solid rgba(16,64,107,0.09)",
                      borderRadius:20, padding:"22px 20px", cursor:"pointer",
                      transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",
                      boxShadow:"0 2px 8px rgba(16,64,107,0.06)",
                      position:"relative", overflow:"hidden",
                    }}
                    onMouseEnter={e2 => {
                      (e2.currentTarget as HTMLElement).style.transform="translateY(-3px)";
                      (e2.currentTarget as HTMLElement).style.boxShadow="0 12px 32px rgba(16,64,107,0.13)";
                      (e2.currentTarget as HTMLElement).style.borderColor="rgba(34,132,192,0.25)";
                    }}
                    onMouseLeave={e2 => {
                      (e2.currentTarget as HTMLElement).style.transform="translateY(0)";
                      (e2.currentTarget as HTMLElement).style.boxShadow="0 2px 8px rgba(16,64,107,0.06)";
                      (e2.currentTarget as HTMLElement).style.borderColor="rgba(16,64,107,0.09)";
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg, #10406B, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif" }}>
                        {e.nom.charAt(0)}
                      </div>
                      <ChevronRight size={16} color="#B0C4D4"/>
                    </div>

                    <div className="font-display" style={{ fontSize:16, fontWeight:800, color:"#0D2137", marginBottom:4 }}>{e.nom}</div>
                    {e.secteur && <div style={{ fontSize:12, color:"#2284C0", fontWeight:600, marginBottom:4 }}>{e.secteur}</div>}
                    {e.localisation && (
                      <div style={{ fontSize:12, color:"#5A7A96", display:"flex", alignItems:"center", gap:4, marginBottom:12 }}>
                        <MapPin size={10}/>{e.localisation}
                      </div>
                    )}

                    {/* Stats */}
                    <div style={{ display:"flex", gap:12, paddingTop:12, borderTop:"1px solid rgba(16,64,107,0.06)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
                        <Briefcase size={11}/><span style={{ fontWeight:700, color:"#10406B" }}>{e._count.offres}</span> offre{e._count.offres!==1?"s":""}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
                        <Users size={11}/><span style={{ fontWeight:700, color:"#EE813D" }}>{totalC}</span> candidat{totalC!==1?"s":""}
                      </div>
                      {ouvertes > 0 && (
                        <div style={{ marginLeft:"auto", background:"rgba(26,158,111,0.1)", color:"#1A9E6F", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>
                          {ouvertes} ouverte{ouvertes!==1?"s":""}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}