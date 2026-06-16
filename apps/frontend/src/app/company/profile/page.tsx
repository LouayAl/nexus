// frontend/src/app/company/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit2, MapPin, Mail, Building2,
  Briefcase, Users, CheckCircle, X, Loader2,
  LinkIcon, Tag,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { entreprisesApi, offresApi, type EntrepriseProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { LocationInput } from "@/components/ui/LocationInput";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { ColoredSelect } from "@/app/admin/components/ColoredSelect";


// ── Helpers ───────────────────────────────────────────────────────────────────
const SECTEURS = [
  // Tech
  "Tech & Logiciel",
  "Data & Intelligence Artificielle",
  "Cloud & DevOps",
  "Cybersécurité",
  "Télécommunications",

  // Business & Finance
  "Finance & Banque",
  "Fintech & Paiement",
  "Comptabilité & Audit",
  "Assurance",
  "Conseil & Management",

  // Marketing & Commerce
  "Marketing & Communication",
  "Publicité & Médias",
  "E-commerce & Retail",
  "Ventes & Business Development",

  // Industrie & Ingénierie
  "Industrie & Manufacturing",
  "Automobile & Mobilité",
  "Aéronautique & Défense",
  "Énergie & Utilities",
  "BTP & Immobilier",
  "Chimie & Matériaux",

  // Santé & Sciences
  "Santé & Médical",
  "Pharmacie & Biotechnologie",
  "Recherche & Sciences",

  // RH & Services
  "Ressources Humaines",
  "Formation & Éducation",
  "Juridique & Conformité",
  "Logistique & Supply Chain",
  "Transport & Livraison",
  "Tourisme & Hôtellerie",
  "Restauration & Alimentation",

  // Créatif & Design
  "Design & UX/UI",
  "Architecture & Urbanisme",
  "Médias & Divertissement",
  "Mode & Luxe",

  // Impact & Public
  "GreenTech & Environnement",
  "Agriculture & Agritech",
  "Administration Publique",
  "ONG & Associations",

  "Autre",
];

function completionPct(p: EntrepriseProfile) {
  let score = 0;
  if (p.nom)          score += 25;
  if (p.description)  score += 25;
  if (p.secteur)      score += 15;
  if (p.localisation) score += 15;
  if (p.siteWeb)      score += 10;
  if (p.logoUrl)      score += 10;
  return score;
}

function useWindowWidth() {
  const [width, setWidth] = useState(1200); // same default on server + client

  useEffect(() => {
    setWidth(window.innerWidth); // update only after hydration
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16, pointerEvents:"none" }}>
        <div style={{
          background:"white", borderRadius:24, width:"100%", maxWidth:540,
          maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column",
          boxShadow:"0 32px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)",
          pointerEvents:"all",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(16,64,107,0.07)", flexShrink:0 }}>
            <h3 className="font-display" style={{ fontSize:20, fontWeight:800, color:"#0D2137" }}>{title}</h3>
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={15} color="#5A7A96"/>
            </button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>{children}</div>
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
  background:"#FAFAF8", boxSizing:"border-box", transition:"border-color 0.15s",
};
const focusBorder = (e: React.FocusEvent<any>) => (e.target.style.borderColor = "#2284C0");
const blurBorder  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(16,64,107,0.12)");

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose }: { profile: EntrepriseProfile; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nom:          profile.nom          ?? "",
    description:  profile.description  ?? "",
    secteur:      profile.secteur      ?? "",
    localisation: profile.localisation ?? "",
    siteWeb:      profile.siteWeb      ?? "",
  });

  const mut = useMutation({
    mutationFn: () => entreprisesApi.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["entreprise-profile"] });
      toast.success("Profil mis à jour !");
      onClose();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <Modal title="Modifier le profil" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Nom de l'entreprise">
          <input style={iSx} value={form.nom} onChange={set("nom")} required onFocus={focusBorder} onBlur={blurBorder} placeholder="TechNova SAS"/>
        </Field>
        <Field label="Secteur d'activité">
          <ColoredSelect
            value={form.secteur}
            onChange={v => setForm(f => ({ ...f, secteur: v }))}
            placeholder="— Sélectionner —"
            searchable
            options={SECTEURS.map(s => ({ value: s, label: s }))}
          />
        </Field>
        <Field label="Localisation">
          <LocationInput
            style={iSx}
            value={form.localisation}
            onChange={v => setForm(f => ({ ...f, localisation: v }))}
          />
        </Field>
        <Field label="Site web">
          <input style={iSx} value={form.siteWeb} onChange={set("siteWeb")} onFocus={focusBorder} onBlur={blurBorder} placeholder="https://monentreprise.com"/>
        </Field>
        <Field label="Description">
          <textarea
            style={{ ...iSx, minHeight:100, resize:"vertical" } as any}
            value={form.description} onChange={set("description")}
            onFocus={focusBorder} onBlur={blurBorder}
            placeholder="Décrivez votre entreprise, votre mission, vos valeurs…"
          />
        </Field>
        <button type="submit" disabled={mut.isPending} style={{
          width:"100%", padding:"13px",
          background: mut.isPending ? "rgba(16,64,107,0.4)" : "linear-gradient(135deg, #10406B, #2284C0)",
          border:"none", borderRadius:12, color:"white",
          fontSize:14, fontWeight:700, cursor:mut.isPending ? "not-allowed" : "pointer",
          fontFamily:"'DM Sans',sans-serif",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          boxShadow:"0 4px 20px rgba(16,64,107,0.25)",
        }}>
          {mut.isPending
            ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> Enregistrement…</>
            : "Enregistrer les modifications"
          }
        </button>
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CompanyProfilePage() {
  const { user }       = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["entreprise-profile"],
    queryFn:  () => entreprisesApi.getProfile().then(r => r.data),
  });

  const { data: offres = [] } = useQuery({
    queryKey: ["mes-offres"],
    queryFn:  () => offresApi.mesOffres().then(r => r.data),
  });

  if (loadingProfile) return (
    <AppShell pageTitle="Mon Profil">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400, gap:12 }}>
        <Loader2 size={28} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
        <span style={{ color:"#5A7A96" }}>Chargement du profil…</span>
      </div>
    </AppShell>
  );

  if (!profile) return null;

  const pct               = completionPct(profile);
  const totalCandidatures = offres.reduce((s, o) => s + (o._count?.candidatures ?? 0), 0);
  const ouvertes          = offres.filter(o => o.statut === "OUVERTE").length;
  const initials          = profile.nom?.slice(0, 2).toUpperCase() ?? "EN";

  // ── Reusable section components ───────────────────────────────────────────

  const IdentityCard = (
    <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>

      {/* Avatar row */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{
            width: isMobile ? 64 : 80, height: isMobile ? 64 : 80,
            borderRadius:18, background:"linear-gradient(135deg, #10406B, #2284C0)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: isMobile ? 22 : 28, fontWeight:900, color:"white",
            fontFamily:"'Fraunces',serif", boxShadow:"0 8px 24px rgba(16,64,107,0.2)",
          }}>
            {initials}
          </div>
          <button onClick={() => setShowEdit(true)} style={{
            position:"absolute", bottom:-2, right:-2,
            width:24, height:24, borderRadius:"50%",
            background:"#EE813D", border:"2px solid white",
            display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
          }}>
            <Edit2 size={11} color="white"/>
          </button>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="font-display" style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:"#0D2137", marginBottom:3 }}>{profile.nom}</div>
          {profile.secteur && <div style={{ color:"#2284C0", fontSize:13, fontWeight:600, marginBottom:3 }}>{profile.secteur}</div>}
          {profile.localisation && (
            <div style={{ color:"#B0C4D4", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
              <MapPin size={11}/>{profile.localisation}
            </div>
          )}
        </div>
      </div>

      {/* Completion bar */}
      <div style={{ padding:"16px 0", borderTop:"1px solid rgba(16,64,107,0.07)", borderBottom:"1px solid rgba(16,64,107,0.07)", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>Profil complété</span>
          <span style={{ fontSize:12, fontWeight:700, color: pct >= 80 ? "#1A9E6F" : "#EE813D" }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:"#F0F4F8", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:"linear-gradient(90deg, #EE813D, #2284C0)", transition:"width 0.6s" }}/>
        </div>
        {pct < 100 && (
          <div style={{ fontSize:11, color:"#B0C4D4", marginTop:8 }}>
            {!profile.description   && <div>· Ajoutez une description</div>}
            {!profile.secteur       && <div>· Précisez votre secteur</div>}
            {!profile.siteWeb       && <div>· Ajoutez votre site web</div>}
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div style={{ display:"flex", marginBottom:16 }}>
        {[
          [String(offres.length),     "Offres"],
          [String(ouvertes),          "Ouvertes"],
          [String(totalCandidatures), "Candidats"],
        ].map(([v, l], i, arr) => (
          <div key={l} style={{ flex:1, textAlign:"center", borderRight:i<arr.length-1?"1px solid rgba(16,64,107,0.07)":"none", padding:"0 8px" }}>
            <div className="font-display" style={{ fontSize:20, fontWeight:800, color:"#2284C0" }}>{v}</div>
            <div style={{ color:"#5A7A96", fontSize:11, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowEdit(true)} style={{
        width:"100%", padding:"11px",
        background:"linear-gradient(135deg, #10406B, #2284C0)",
        border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700,
        cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        boxShadow:"0 4px 14px rgba(16,64,107,0.25)",
      }}>
        <Edit2 size={14}/> Modifier le profil
      </button>
    </div>
  );

  const InfoCard = (
    <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>Informations</div>
      {[
        { Icon:Mail,    val: user?.email              ?? "—",               label:"Email" },
        { Icon:MapPin,  val: profile.localisation     ?? "Non renseigné",   label:"Localisation" },
        { Icon:Tag,     val: profile.secteur          ?? "Non renseigné",   label:"Secteur" },
        { Icon:LinkIcon,val: profile.siteWeb          ?? "Non renseigné",   label:"Site web", href: profile.siteWeb },
      ].map(({ Icon, val, label, href }) => (
        <div key={label} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={13} color="#2284C0"/>
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:10, color:"#B0C4D4", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</div>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" style={{ color:"#2284C0", fontSize:12, fontWeight:500, textDecoration:"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{val}</a>
            ) : (
              <div style={{ color:"#5A7A96", fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{val}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const DescriptionCard = (
    <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>À propos</div>
        <button onClick={() => setShowEdit(true)} style={{ background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
          <Edit2 size={12}/> Modifier
        </button>
      </div>
      {profile.description ? (
        <p style={{ fontSize:14, color:"#3D5A73", lineHeight:1.8, margin:0 }}>{profile.description}</p>
      ) : (
        <div style={{ textAlign:"center", padding:"32px 0", color:"#B0C4D4" }}>
          <Building2 size={32} style={{ marginBottom:8, opacity:0.4 }}/>
          <div style={{ fontSize:13 }}>Aucune description ajoutée</div>
          <button onClick={() => setShowEdit(true)} style={{ marginTop:12, padding:"7px 16px", borderRadius:8, background:"rgba(34,132,192,0.08)", border:"1px solid rgba(34,132,192,0.15)", color:"#2284C0", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Ajouter une description
          </button>
        </div>
      )}
    </div>
  );

  const StatsCards = (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap:12 }}>
      {[
        { label:"Total offres",    value:offres.length,     color:"#2284C0", icon:Briefcase,   desc:"publiées" },
        { label:"Candidatures",    value:totalCandidatures, color:"#EE813D", icon:Users,       desc:"reçues au total" },
        { label:"Offres ouvertes", value:ouvertes,          color:"#1A9E6F", icon:CheckCircle, desc:"en recrutement" },
      ].map((s, i) => (
        <div key={i} style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:"16px 18px", boxShadow:"0 1px 6px rgba(16,64,107,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <s.icon size={16} color={s.color}/>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:"#5A7A96", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</span>
          </div>
          <div className="font-display" style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
          <div style={{ fontSize:11, color:"#B0C4D4", marginTop:4 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  );

  const RecentOffresCard = (
    <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>Offres récentes</div>
        <Link href="/company/dashboard" style={{ fontSize:12, color:"#2284C0", fontWeight:600, textDecoration:"none" }}>Voir tout →</Link>
      </div>
      {offres.length === 0 ? (
        <div style={{ textAlign:"center", padding:"24px 0", color:"#B0C4D4" }}>
          <Briefcase size={28} style={{ marginBottom:8, opacity:0.4 }}/>
          <div style={{ fontSize:13 }}>Aucune offre publiée</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {offres.slice(0, 4).map(o => {
            const statutColor = o.statut === "OUVERTE" ? "#1A9E6F" : o.statut === "EN_ATTENTE" ? "#EE813D" : "#D64045";
            const statutBg    = o.statut === "OUVERTE" ? "rgba(26,158,111,0.1)" : o.statut === "EN_ATTENTE" ? "rgba(238,129,61,0.1)" : "rgba(214,64,69,0.1)";
            const statutLabel = o.statut === "OUVERTE" ? "Ouverte" : o.statut === "EN_ATTENTE" ? "En attente" : "Fermée";
            return (
              <div key={o.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#F7F8FA", borderRadius:12, border:"1px solid rgba(16,64,107,0.07)" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0D2137", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
                  <div style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span>{o.type_contrat}</span>
                    {o.localisation && <><span>·</span><span>{o.localisation}</span></>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
                    <Users size={11}/>{o._count?.candidatures ?? 0}
                  </div>
                  <span style={{ background:statutBg, color:statutColor, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99, whiteSpace:"nowrap" }}>{statutLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

const AccountCard = (
  <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>Compte</div>
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {[
        { label:"Email",     value: user?.email ?? "—" },
        { label:"Rôle",      value: "Recruteur"         },
        { label:"ID compte", value: `#${profile.utilisateurId}` },
      ].map(({ label, value }) => (
        <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(16,64,107,0.05)" }}>
          <span style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>{label}</span>
          <span style={{ fontSize:12, color:"#0D2137", fontWeight:600 }}>{value}</span>
        </div>
      ))}
    </div>

    {/* Change password button */}
    <button
      onClick={() => setShowChangePw(true)}
      style={{
        marginTop:14, width:"100%", padding:"10px",
        borderRadius:10, border:"1px solid rgba(16,64,107,0.12)",
        background:"white", color:"#5A7A96", fontSize:13, fontWeight:600,
        cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        transition:"all 0.18s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#2284C0"; (e.currentTarget as HTMLElement).style.color="#2284C0"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(16,64,107,0.12)"; (e.currentTarget as HTMLElement).style.color="#5A7A96"; }}
    >
      🔒 Changer le mot de passe
    </button>
  </div>
);

  return (
    <AppShell pageTitle="Mon Profil Entreprise">
      {showEdit && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)}/>}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)}/>}

      {/* Page header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Espace recruteur</div>
        <h1 className="font-display" style={{ fontSize: isMobile ? 24 : 32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>Mon Profil Entreprise</h1>
      </div>

      {isMobile ? (
        /* ── Mobile: single column ───────────────────────────────────────── */
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {IdentityCard}
          {DescriptionCard}
          {StatsCards}
          {InfoCard}
          {RecentOffresCard}
          {AccountCard}
        </div>
      ) : (
        /* ── Desktop: two columns ────────────────────────────────────────── */
        <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:24 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {IdentityCard}
            {InfoCard}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {DescriptionCard}
            {StatsCards}
            {RecentOffresCard}
            {AccountCard}
          </div>
        </div>
      )}
    </AppShell>
  );
}