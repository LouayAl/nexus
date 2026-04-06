"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit2, MapPin, Globe, Mail, Phone, Building2,
  Briefcase, Users, TrendingUp, X, Loader2,
  Upload, CheckCircle, Link as LinkIcon, Tag,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { entreprisesApi, offresApi, type EntrepriseProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

// ── Helpers ───────────────────────────────────────────────────────────────────
const SECTEURS = [
  "Tech & Logiciel","Data & IA","Cloud & DevOps","Cybersécurité",
  "Design & Produit","Marketing & Growth","Finance & Fintech",
  "MedTech & Santé","GreenTech","E-commerce","Conseil","Autre",
];

function completionPct(p: EntrepriseProfile) {
  let score = 0;
  if (p.nom)         score += 25;
  if (p.description) score += 25;
  if (p.secteur)     score += 15;
  if (p.localisation)score += 15;
  if (p.siteWeb)     score += 10;
  if (p.logoUrl)     score += 10;
  return score;
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24, pointerEvents:"none" }}>
        <div style={{
          background:"white", borderRadius:24, width:"100%", maxWidth:540,
          maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column",
          boxShadow:"0 32px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)",
          pointerEvents:"all",
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
  background:"#FAFAF8", boxSizing:"border-box", transition:"border-color 0.15s",
};

const focusBorder = (e: React.FocusEvent<any>) => (e.target.style.borderColor = "#2284C0");
const blurBorder  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(16,64,107,0.12)");

// ── Edit Profile Modal ────────────────────────────────────────────────────────
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
          <select style={iSx} value={form.secteur} onChange={set("secteur")} onFocus={focusBorder} onBlur={blurBorder}>
            <option value="">— Sélectionner —</option>
            {SECTEURS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Localisation">
          <input style={iSx} value={form.localisation} onChange={set("localisation")} onFocus={focusBorder} onBlur={blurBorder} placeholder="Paris, France"/>
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
          fontSize:14, fontWeight:700, cursor:mut.isPending?"not-allowed":"pointer",
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
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);

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

  const pct              = completionPct(profile);
  const totalCandidatures = offres.reduce((s, o) => s + (o._count?.candidatures ?? 0), 0);
  const ouvertes          = offres.filter(o => o.statut === "OUVERTE").length;
  const initials          = profile.nom?.slice(0,2).toUpperCase() ?? "EN";

  return (
    <AppShell pageTitle="Mon Profil Entreprise">
      {showEdit && profile && <EditProfileModal profile={profile} onClose={() => setShowEdit(false)}/>}

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Espace recruteur</div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>Mon Profil Entreprise</h1>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:24 }}>

        {/* ── Left column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Identity card */}
          <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:28, textAlign:"center", boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>

            {/* Logo / Avatar */}
            <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
              <div style={{
                width:88, height:88, borderRadius:20, margin:"0 auto",
                background:"linear-gradient(135deg, #10406B, #2284C0)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:32, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif",
                boxShadow:"0 8px 24px rgba(16,64,107,0.2)",
              }}>
                {initials}
              </div>
              <button onClick={() => setShowEdit(true)} style={{
                position:"absolute", bottom:0, right:0,
                width:28, height:28, borderRadius:"50%",
                background:"#EE813D", border:"2px solid white",
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              }}>
                <Edit2 size={12} color="white"/>
              </button>
            </div>

            <div className="font-display" style={{ fontSize:22, fontWeight:800, color:"#0D2137", marginBottom:4 }}>
              {profile.nom}
            </div>
            {profile.secteur && (
              <div style={{ color:"#2284C0", fontSize:13, fontWeight:600, marginBottom:6 }}>{profile.secteur}</div>
            )}
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
                <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:"linear-gradient(90deg, #EE813D, #2284C0)", transition:"width 0.6s" }}/>
              </div>
              {pct < 100 && (
                <div style={{ fontSize:11, color:"#B0C4D4", marginTop:8, textAlign:"left" }}>
                  {!profile.description  && "· Ajoutez une description\n"}
                  {!profile.secteur      && "· Précisez votre secteur\n"}
                  {!profile.siteWeb      && "· Ajoutez votre site web"}
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:"flex", marginBottom:20 }}>
              {[
                [String(offres.length),        "Offres"],
                [String(ouvertes),             "Ouvertes"],
                [String(totalCandidatures),    "Candidats"],
              ].map(([v, l], i, arr) => (
                <div key={l} style={{ flex:1, textAlign:"center", borderRight:i<arr.length-1?"1px solid rgba(16,64,107,0.07)":"none", padding:"0 8px" }}>
                  <div className="font-display" style={{ fontSize:20, fontWeight:800, color:"#2284C0" }}>{v}</div>
                  <div style={{ color:"#5A7A96", fontSize:11, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Edit button */}
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

          {/* Contact & Info */}
          <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>Informations</div>
            {[
              { Icon:Mail,      val: user?.email            ?? "—",           label:"Email" },
              { Icon:MapPin,    val: profile.localisation   ?? "Non renseigné", label:"Localisation" },
              { Icon:Tag,       val: profile.secteur        ?? "Non renseigné", label:"Secteur" },
              { Icon:LinkIcon,  val: profile.siteWeb        ?? "Non renseigné", label:"Site web", href: profile.siteWeb },
            ].map(({ Icon, val, label, href }) => (
              <div key={label} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={13} color="#2284C0"/>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#B0C4D4", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</div>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" style={{ color:"#2284C0", fontSize:12, fontWeight:500, textDecoration:"none" }}>{val}</a>
                  ) : (
                    <div style={{ color:"#5A7A96", fontSize:12, fontWeight:500 }}>{val}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Description */}
          <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:28, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>À propos de l'entreprise</div>
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

          {/* Stats cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {[
              { label:"Total offres",      value:offres.length,       color:"#2284C0", icon:Briefcase,   desc:"publiées" },
              { label:"Candidatures",      value:totalCandidatures,   color:"#EE813D", icon:Users,       desc:"reçues au total" },
              { label:"Offres ouvertes",   value:ouvertes,            color:"#1A9E6F", icon:CheckCircle, desc:"en cours de recrutement" },
            ].map((s, i) => (
              <div key={i} style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:"18px 20px", boxShadow:"0 1px 6px rgba(16,64,107,0.05)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <s.icon size={17} color={s.color}/>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:"#5A7A96", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</span>
                </div>
                <div className="font-display" style={{ fontSize:28, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#B0C4D4", marginTop:4 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Recent offers preview */}
          <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>Offres récentes</div>
              <a href="/company/dashboard" style={{ fontSize:12, color:"#2284C0", fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                Voir tout →
              </a>
            </div>
            {offres.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"#B0C4D4" }}>
                <Briefcase size={28} style={{ marginBottom:8, opacity:0.4 }}/>
                <div style={{ fontSize:13 }}>Aucune offre publiée</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {offres.slice(0,4).map(o => {
                  const statutColor = o.statut === "OUVERTE" ? "#1A9E6F" : o.statut === "EN_ATTENTE" ? "#EE813D" : "#D64045";
                  const statutBg    = o.statut === "OUVERTE" ? "rgba(26,158,111,0.1)" : o.statut === "EN_ATTENTE" ? "rgba(238,129,61,0.1)" : "rgba(214,64,69,0.1)";
                  const statutLabel = o.statut === "OUVERTE" ? "Ouverte" : o.statut === "EN_ATTENTE" ? "En attente" : "Fermée";
                  return (
                    <div key={o.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", background:"#F7F8FA", borderRadius:12, border:"1px solid rgba(16,64,107,0.07)" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0D2137", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.titre}</div>
                        <div style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:8 }}>
                          <span>{o.type_contrat}</span>
                          {o.localisation && <><span>·</span><span>{o.localisation}</span></>}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#5A7A96" }}>
                          <Users size={11}/> {o._count?.candidatures ?? 0}
                        </div>
                        <span style={{ background:statutBg, color:statutColor, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{statutLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account info */}
          <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>Compte</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { label:"Email",     value: user?.email   ?? "—" },
                { label:"Rôle",      value: "Recruteur"          },
                { label:"ID compte", value: `#${profile.utilisateurId}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(16,64,107,0.05)" }}>
                  <span style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>{label}</span>
                  <span style={{ fontSize:12, color:"#0D2137", fontWeight:600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}