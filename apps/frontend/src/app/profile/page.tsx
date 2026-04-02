"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail, Phone, MapPin, Plus, Upload, Edit2,
  Briefcase, Star, Award, Globe2, Trash2, X,
  CheckCircle, Loader2, Download,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  candidatsApi,
  type CandidatProfile, type ExperienceDto, type FormationDto, type LangueDto,
} from "@/lib/api";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

// ── helpers ───────────────────────────────────────────────────────────────────
const SKILL_COLORS = ["#2284C0","#10406B","#1A9E6F","#EE813D","#7C3AED","#D64045"];
const NIVEAU_OPTIONS = ["Débutant","Intermédiaire","Avancé","Natif"];
const LANGUE_NIVEAU_COLORS: Record<string, string> = {
  "Débutant":"#B0C4D4", "Intermédiaire":"#2284C0", "Avancé":"#1A9E6F", "Natif":"#10406B",
};

function initials(p: CandidatProfile) {
  return `${p.prenom?.[0] ?? ""}${p.nom?.[0] ?? ""}`.toUpperCase();
}

function completionPct(p: CandidatProfile) {
  let score = 0;
  if (p.prenom && p.nom)      score += 20;
  if (p.titre)                score += 15;
  if (p.bio)                  score += 15;
  if (p.telephone)            score += 10;
  if (p.localisation)         score += 10;
  if (p.cvUrl)                score += 10;
  if ((p.competences?.length  ?? 0) > 0) score += 10;
  if ((p.experiences?.length  ?? 0) > 0) score += 5;
  if ((p.formations?.length   ?? 0) > 0) score += 5;
  return score;
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24, pointerEvents:"none" }}>
        <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:480, boxShadow:"0 24px 80px rgba(16,64,107,0.2)", pointerEvents:"all", overflow:"hidden" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
            <h3 className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>{title}</h3>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color="#5A7A96"/>
            </button>
          </div>
          <div style={{ padding:"24px" }}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ── Input helper ──────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputSx: React.CSSProperties = {
  width:"100%", padding:"11px 14px", borderRadius:10,
  border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
  fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
  background:"#FAFAF8", boxSizing:"border-box",
};

// ── Submit button ─────────────────────────────────────────────────────────────
function SubmitBtn({ loading, label = "Enregistrer" }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:"100%", padding:"12px", marginTop:8,
      background:"linear-gradient(135deg, #10406B, #2284C0)",
      border:"none", borderRadius:11, color:"white",
      fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer",
      fontFamily:"'DM Sans',sans-serif", opacity:loading?0.75:1,
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    }}>
      {loading ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> Enregistrement…</> : label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════

function EditProfileModal({ profile, onClose }: { profile: CandidatProfile; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    prenom:      profile.prenom      ?? "",
    nom:         profile.nom         ?? "",
    titre:       profile.titre       ?? "",
    bio:         profile.bio         ?? "",
    telephone:   profile.telephone   ?? "",
    localisation:profile.localisation ?? "",
  });
  const mut = useMutation({
    mutationFn: () => candidatsApi.updateProfile(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Profil mis à jour"); onClose(); },
    onError:   () => toast.error("Erreur lors de la mise à jour"),
  });
  return (
    <Modal title="Modifier le profil" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Prénom">
            <input style={inputSx} value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom:e.target.value }))} required/>
          </Field>
          <Field label="Nom">
            <input style={inputSx} value={form.nom} onChange={e => setForm(f => ({ ...f, nom:e.target.value }))} required/>
          </Field>
        </div>
        <Field label="Titre professionnel">
          <input style={inputSx} value={form.titre} onChange={e => setForm(f => ({ ...f, titre:e.target.value }))} placeholder="Ex: Senior React Developer"/>
        </Field>
        <Field label="Bio">
          <textarea style={{ ...inputSx, minHeight:80, resize:"vertical" } as any} value={form.bio} onChange={e => setForm(f => ({ ...f, bio:e.target.value }))} placeholder="Présentez-vous en quelques mots…"/>
        </Field>
        <Field label="Téléphone">
          <input style={inputSx} value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone:e.target.value }))} placeholder="+212 6XX XXX XXX"/>
        </Field>
        <Field label="Localisation">
          <input style={inputSx} value={form.localisation} onChange={e => setForm(f => ({ ...f, localisation:e.target.value }))} placeholder="Casablanca, Maroc"/>
        </Field>
        <SubmitBtn loading={mut.isPending}/>
      </form>
    </Modal>
  );
}

function AddSkillModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState(70);

  // Use the dedicated "addCompetence" mutation
  const mut = useMutation({
    mutationFn: () => candidatsApi.addSkill({ nom, niveau }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] }); // refresh profile to show new skill
      toast.success("Compétence ajoutée");
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  return (
    <Modal title="Ajouter une compétence" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <Field label="Nom de la compétence">
          <input
            style={inputSx}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="React, Python, Figma…"
            required
          />
        </Field>
        <Field label={`Niveau : ${niveau}%`}>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={niveau}
            onChange={(e) => setNiveau(+e.target.value)}
            style={{ width: "100%", accentColor: "#2284C0" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#B0C4D4",
              marginTop: 4,
            }}
          >
            <span>Débutant</span>
            <span>Expert</span>
          </div>
        </Field>
        <SubmitBtn loading={mut.isPending} label="Ajouter" />
      </form>
    </Modal>
  );
}

function skillLevelLabel(niveau: number) {
  if (niveau <= 40) return "Débutant";
  if (niveau <= 70) return "Intermédiaire";
  return "Expert";
}

function AddExperienceModal({ onClose, existing }: { onClose: () => void; existing?: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ExperienceDto>({
    poste:       existing?.poste       ?? "",
    entreprise:  existing?.entreprise  ?? "",
    dateDebut:   existing?.dateDebut   ?? "",
    dateFin:     existing?.dateFin     ?? "",
    actuel:      existing?.actuel      ?? false,
    description: existing?.description ?? "",
  });
  const isEdit = !!existing;
  const mut = useMutation({
    mutationFn: () => isEdit
      ? candidatsApi.updateExperience(existing.id, form)
      : candidatsApi.addExperience(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success(isEdit ? "Modifié" : "Expérience ajoutée"); onClose(); },
    onError:   () => toast.error("Erreur"),
  });
  return (
    <Modal title={isEdit ? "Modifier l'expérience" : "Ajouter une expérience"} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Poste">
          <input style={inputSx} value={form.poste} onChange={e => setForm(f => ({ ...f, poste:e.target.value }))} placeholder="Senior React Developer" required/>
        </Field>
        <Field label="Entreprise">
          <input style={inputSx} value={form.entreprise} onChange={e => setForm(f => ({ ...f, entreprise:e.target.value }))} placeholder="TechCorp SA" required/>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Date de début">
            <input style={inputSx} value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut:e.target.value }))} placeholder="2022" required/>
          </Field>
          <Field label="Date de fin">
            <input style={inputSx} value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin:e.target.value }))} placeholder="2024" disabled={form.actuel}/>
          </Field>
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#5A7A96", marginBottom:14, cursor:"pointer" }}>
          <input type="checkbox" checked={form.actuel} onChange={e => setForm(f => ({ ...f, actuel:e.target.checked, dateFin:"" }))}/>
          Poste actuel
        </label>
        <Field label="Description">
          <textarea style={{ ...inputSx, minHeight:72, resize:"vertical" } as any} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Décrivez vos responsabilités…"/>
        </Field>
        <SubmitBtn loading={mut.isPending} label={isEdit ? "Modifier" : "Ajouter"}/>
      </form>
    </Modal>
  );
}

function AddFormationModal({ onClose, existing }: { onClose: () => void; existing?: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormationDto>({
    diplome: existing?.diplome ?? "",
    ecole:   existing?.ecole   ?? "",
    annee:   existing?.annee   ?? "",
  });
  const isEdit = !!existing;
  const mut = useMutation({
    mutationFn: () => isEdit
      ? candidatsApi.updateFormation(existing.id, form)
      : candidatsApi.addFormation(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success(isEdit ? "Modifié" : "Formation ajoutée"); onClose(); },
    onError:   () => toast.error("Erreur"),
  });
  return (
    <Modal title={isEdit ? "Modifier la formation" : "Ajouter une formation"} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Diplôme">
          <input style={inputSx} value={form.diplome} onChange={e => setForm(f => ({ ...f, diplome:e.target.value }))} placeholder="Master Informatique" required/>
        </Field>
        <Field label="École / Université">
          <input style={inputSx} value={form.ecole} onChange={e => setForm(f => ({ ...f, ecole:e.target.value }))} placeholder="Université Paris-Saclay" required/>
        </Field>
        <Field label="Année d'obtention">
          <input style={inputSx} value={form.annee} onChange={e => setForm(f => ({ ...f, annee:e.target.value }))} placeholder="2022" required/>
        </Field>
        <SubmitBtn loading={mut.isPending} label={isEdit ? "Modifier" : "Ajouter"}/>
      </form>
    </Modal>
  );
}

function AddLangueModal({ onClose, existing }: { onClose: () => void; existing?: any }) {
  const qc = useQueryClient();
  const [nom,    setNom]    = useState(existing?.nom    ?? "");
  const [niveau, setNiveau] = useState(existing?.niveau ?? "Intermédiaire");
  const isEdit = !!existing;
  const mut = useMutation({
    mutationFn: () => isEdit
      ? candidatsApi.updateLangue(existing.id, { nom, niveau })
      : candidatsApi.addLangue({ nom, niveau }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success(isEdit ? "Modifié" : "Langue ajoutée"); onClose(); },
    onError:   () => toast.error("Erreur"),
  });
  return (
    <Modal title={isEdit ? "Modifier la langue" : "Ajouter une langue"} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Langue">
          <input style={inputSx} value={nom} onChange={e => setNom(e.target.value)} placeholder="Français, Anglais, Arabe…" required/>
        </Field>
        <Field label="Niveau">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {NIVEAU_OPTIONS.map(n => (
              <button key={n} type="button" onClick={() => setNiveau(n)} style={{
                padding:"9px 12px", borderRadius:10, border:`2px solid ${niveau===n ? LANGUE_NIVEAU_COLORS[n] : "rgba(16,64,107,0.1)"}`,
                background: niveau===n ? `${LANGUE_NIVEAU_COLORS[n]}12` : "#FAFAF8",
                color: niveau===n ? LANGUE_NIVEAU_COLORS[n] : "#5A7A96",
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              }}>{n}</button>
            ))}
          </div>
        </Field>
        <SubmitBtn loading={mut.isPending} label={isEdit ? "Modifier" : "Ajouter"}/>
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
type ModalType = null | "editProfile" | "addSkill" | "addExp" | "addForm" | "addLang";

export default function ProfilePage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab,          setTab]          = useState<"skills"|"experience"|"formation"|"langues">("skills");
  const [modal,        setModal]        = useState<ModalType>(null);
  const [editingItem,  setEditingItem]  = useState<any>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn:  () => candidatsApi.getProfile().then(r => r.data),
  });

  // Delete mutations
  const delExp  = useMutation({ mutationFn: (id: number) => candidatsApi.deleteExperience(id),  onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Supprimé"); } });
  const delForm = useMutation({ mutationFn: (id: number) => candidatsApi.deleteFormation(id),   onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Supprimé"); } });
  const delLang = useMutation({ mutationFn: (id: number) => candidatsApi.deleteLangue(id),      onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Supprimé"); } });

  // CV upload
  const uploadCv = useMutation({
    mutationFn: (file: File) => candidatsApi.uploadCv(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["profile"] }); toast.success("CV importé !"); },
    onError:   () => toast.error("Erreur lors de l'upload"),
  });

  if (isLoading) return (
    <AppShell pageTitle="Mon Profil">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400, gap:12 }}>
        <Loader2 size={28} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
        <span style={{ color:"#5A7A96" }}>Chargement du profil…</span>
      </div>
    </AppShell>
  );

  if (!profile) return null;

  const pct      = completionPct(profile);
  const skills   = profile.competences ?? [];
  const exps     = profile.experiences ?? [];
  const forms    = profile.formations  ?? [];
  const langs    = profile.langues     ?? [];

  const tabs = [
    { key:"skills",     label:"Compétences", icon: Star,     count: skills.length },
    { key:"experience", label:"Expérience",  icon: Briefcase,count: exps.length   },
    { key:"formation",  label:"Formation",   icon: Award,    count: forms.length  },
    { key:"langues",    label:"Langues",     icon: Globe2,   count: langs.length  },
  ] as const;

  return (
    <AppShell pageTitle="Mon Profil">
      {/* Modals */}
      {modal === "editProfile" && <EditProfileModal profile={profile} onClose={() => setModal(null)}/>}
      {modal === "addSkill"    && <AddSkillModal onClose={() => setModal(null)}/>}
      {modal === "addExp"      && <AddExperienceModal onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem}/>}
      {modal === "addForm"     && <AddFormationModal  onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem}/>}
      {modal === "addLang"     && <AddLangueModal     onClose={() => { setModal(null); setEditingItem(null); }} existing={editingItem}/>}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadCv.mutate(f); }}
      />

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Mon espace</div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>Mon Profil</h1>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24 }}>

        {/* ── Left column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Identity card */}
          <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:28, textAlign:"center", boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>
            {/* Avatar */}
            <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
              <div style={{
                width:88, height:88, borderRadius:"50%",
                background:"linear-gradient(135deg, #EE813D, #2284C0)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:30, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif",
                margin:"0 auto",
              }}>
                {initials(profile)}
              </div>
              <button onClick={() => setModal("editProfile")} style={{
                position:"absolute", bottom:0, right:0,
                width:28, height:28, borderRadius:"50%",
                background:"#2284C0", border:"2px solid white",
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              }}>
                <Edit2 size={12} color="white"/>
              </button>
            </div>

            <div className="font-display" style={{ fontSize:22, fontWeight:800, color:"#0D2137", marginBottom:4 }}>
              {profile.prenom} {profile.nom}
            </div>
            {profile.titre && <div style={{ color:"#5A7A96", fontSize:14, marginBottom:6 }}>{profile.titre}</div>}
            {profile.localisation && (
              <div style={{ color:"#B0C4D4", fontSize:12, display:"flex", alignItems:"center", gap:4, justifyContent:"center" }}>
                <MapPin size={11}/> {profile.localisation}
              </div>
            )}

            {/* Completion bar */}
            <div style={{ margin:"20px 0", padding:"16px 0", borderTop:"1px solid rgba(16,64,107,0.07)", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>Profil complété</span>
                <span style={{ fontSize:12, fontWeight:700, color: pct >= 80 ? "#1A9E6F" : "#EE813D" }}>{pct}%</span>
              </div>
              <div style={{ height:6, background:"#F0F4F8", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:`linear-gradient(90deg, #EE813D, #2284C0)`, transition:"width 0.6s" }}/>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", marginBottom:20 }}>
              {[
                [String(exps.length),  "Expériences"],
                [String(skills.length),"Compétences"],
                [String(langs.length), "Langues"],
              ].map(([v,l], i, arr) => (
                <div key={String(l)} style={{ flex:1, textAlign:"center", borderRight:i<arr.length-1?"1px solid rgba(16,64,107,0.07)":"none", padding:"0 8px" }}>
                  <div className="font-display" style={{ fontSize:20, fontWeight:800, color:"#2284C0" }}>{v}</div>
                  <div style={{ color:"#5A7A96", fontSize:11, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* CV button */}
            {profile.cvUrl ? (
              <div style={{ display:"flex", gap:8 }}>
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001"}${profile.cvUrl}`}
                     target="_blank" rel="noreferrer" style={{ flex:1, textDecoration:"none" }}>
                  <button style={{ width:"100%", padding:"10px", background:"rgba(26,158,111,0.1)", border:"1px solid rgba(26,158,111,0.2)", borderRadius:11, color:"#1A9E6F", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <Download size={13}/> Mon CV
                  </button>
                </a>
                <button onClick={() => fileRef.current?.click()} style={{ padding:"10px 14px", background:"rgba(238,129,61,0.08)", border:"1px solid rgba(238,129,61,0.15)", borderRadius:11, cursor:"pointer" }}>
                  <Upload size={14} color="#EE813D"/>
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploadCv.isPending} style={{
                width:"100%", padding:"11px",
                background:"linear-gradient(135deg, #EE813D, #d4691f)",
                border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                boxShadow:"0 4px 14px rgba(238,129,61,0.3)", opacity:uploadCv.isPending?0.7:1,
              }}>
                {uploadCv.isPending ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <Upload size={14}/>}
                {uploadCv.isPending ? "Importation…" : "Importer mon CV"}
              </button>
            )}
          </div>

          {/* Contact */}
          <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>Contact</div>
              <button onClick={() => setModal("editProfile")} style={{ background:"none", border:"none", cursor:"pointer", color:"#2284C0", fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>Modifier</button>
            </div>
            {[
              { Icon:Mail,  val:profile.utilisateur?.email  ?? "—" },
              { Icon:Phone, val:profile.telephone            ?? "Non renseigné" },
              { Icon:MapPin,val:profile.localisation         ?? "Non renseigné" },
            ].map(({ Icon, val }, index) => (
              <div key={`${val}-${index}`} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={13} color="#2284C0"/>
                </div>
                <span style={{ color:"#5A7A96", fontSize:13 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>À propos</div>
              <p style={{ fontSize:13, color:"#3D5A73", lineHeight:1.7, margin:0 }}>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:32, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:28, background:"#F7F8FA", borderRadius:12, padding:4 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex:1, padding:"9px 12px", borderRadius:9, border:"none",
                fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.18s",
                background: tab===t.key ? "white" : "transparent",
                color:      tab===t.key ? "#10406B" : "#5A7A96",
                boxShadow:  tab===t.key ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
              }}>
                <t.icon size={13}/> {t.label}
                {t.count > 0 && (
                  <span style={{ background: tab===t.key ? "#10406B" : "#E8EDF2", color: tab===t.key ? "white" : "#5A7A96", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:99 }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Skills tab ── */}
          {tab === "skills" && (
            <div>
              {/* Header with Ajouter button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#0D2137" }}>Compétences techniques</div>
                <button
                  onClick={() => setModal("addSkill")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(34,132,192,0.08)",
                    border: "none",
                    color: "#2284C0",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif"
                  }}
                >
                  <Plus size={13} /> Ajouter
                </button>
              </div>

              {/* No skills placeholder */}
              {skills.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#B0C4D4" }}>
                  <Star size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div style={{ fontSize: 14 }}>Aucune compétence ajoutée</div>
                </div>
              ) : (
                skills.map(({ competence, niveau }, i) => (
                  <div key={competence.id} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0D2137" }}>{competence.nom}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Niveau % + label */}
                        <span style={{ fontSize: 13, fontWeight: 700, color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
                          {niveau}% ({skillLevelLabel(niveau)})
                        </span>
                        {/* Delete button */}
                        <button
                          onClick={async () => {
                            try {
                              await candidatsApi.deleteSkill(competence.id);
                              qc.invalidateQueries({ queryKey:["profile"] });
                              toast.success("Compétence supprimée");
                            } catch (e) {
                              toast.error("Erreur lors de la suppression");
                            }
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#FF4D4F",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 8, background: "#F0F4F8", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${niveau}%`,
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${SKILL_COLORS[i % SKILL_COLORS.length]}80, ${SKILL_COLORS[i % SKILL_COLORS.length]})`,
                          transition: "width 0.6s",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Experience tab ── */}
          {tab === "experience" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>Expérience professionnelle</div>
                <button onClick={() => { setEditingItem(null); setModal("addExp"); }} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
              {exps.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#B0C4D4" }}>
                  <Briefcase size={32} style={{ marginBottom:8, opacity:0.4 }}/>
                  <div style={{ fontSize:14 }}>Aucune expérience ajoutée</div>
                </div>
              ) : exps.map((exp, i) => {
                const color = SKILL_COLORS[i % SKILL_COLORS.length];
                return (
                  <div key={exp.id} style={{ display:"flex", gap:16, marginBottom:i<exps.length-1?28:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                      <div style={{ width:12, height:12, borderRadius:"50%", background:color, marginTop:4, boxShadow:`0 0 0 4px ${color}20` }}/>
                      {i < exps.length-1 && <div style={{ width:2, flex:1, background:"rgba(16,64,107,0.07)", marginTop:8, borderRadius:1 }}/>}
                    </div>
                    <div style={{ flex:1, paddingBottom:i<exps.length-1?8:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                        <div className="font-display" style={{ fontSize:15, fontWeight:700, color:"#0D2137" }}>{exp.poste}</div>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <span style={{ fontSize:11, color:"#5A7A96", background:"#F7F8FA", padding:"3px 10px", borderRadius:8 }}>
                            {exp.dateDebut} – {exp.actuel ? "Présent" : (exp.dateFin ?? "?")}
                          </span>
                          <button onClick={() => { setEditingItem(exp); setModal("addExp"); }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Edit2 size={12} color="#5A7A96"/>
                          </button>
                          <button onClick={() => delExp.mutate(exp.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Trash2 size={12} color="#D64045"/>
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color, marginBottom:4 }}>{exp.entreprise}</div>
                      {exp.description && <div style={{ fontSize:13, color:"#5A7A96", lineHeight:1.6 }}>{exp.description}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Formation tab ── */}
          {tab === "formation" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>Formation</div>
                <button onClick={() => { setEditingItem(null); setModal("addForm"); }} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
              {forms.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#B0C4D4" }}>
                  <Award size={32} style={{ marginBottom:8, opacity:0.4 }}/>
                  <div style={{ fontSize:14 }}>Aucune formation ajoutée</div>
                </div>
              ) : forms.map((f, i) => {
                const color = SKILL_COLORS[i % SKILL_COLORS.length];
                return (
                  <div key={f.id} style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:14, padding:"16px 20px", marginBottom:12, borderLeft:`4px solid ${color}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div className="font-display" style={{ fontSize:15, fontWeight:700, color:"#0D2137", marginBottom:4 }}>{f.diplome}</div>
                      <div style={{ fontSize:13, color:"#5A7A96" }}>{f.ecole} · {f.annee}</div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => { setEditingItem(f); setModal("addForm"); }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                        <Edit2 size={12} color="#5A7A96"/>
                      </button>
                      <button onClick={() => delForm.mutate(f.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                        <Trash2 size={12} color="#D64045"/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Langues tab ── */}
          {tab === "langues" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>Langues</div>
                <button onClick={() => { setEditingItem(null); setModal("addLang"); }} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
              {langs.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#B0C4D4" }}>
                  <Globe2 size={32} style={{ marginBottom:8, opacity:0.4 }}/>
                  <div style={{ fontSize:14 }}>Aucune langue ajoutée</div>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {langs.map(l => {
                    const color = LANGUE_NIVEAU_COLORS[l.niveau] ?? "#5A7A96";
                    return (
                      <div key={l.id} style={{ background:"#F7F8FA", border:`1px solid ${color}25`, borderRadius:14, padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15, color:"#0D2137", marginBottom:4 }}>{l.nom}</div>
                          <span style={{ background:`${color}15`, color, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:99 }}>{l.niveau}</span>
                        </div>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={() => { setEditingItem(l); setModal("addLang"); }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Edit2 size={12} color="#5A7A96"/>
                          </button>
                          <button onClick={() => delLang.mutate(l.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Trash2 size={12} color="#D64045"/>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}