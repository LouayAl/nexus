"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  MapPin, Mail, Phone, Briefcase, GraduationCap, Globe,
  Star, FileText, Loader2, Calendar, Building2, Download,
  ShieldCheck, Upload, DollarSign, ClipboardList,UserCheck
} from "lucide-react";
import { Modal } from "./Modal";
import { adminApi } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/avatar";
import { SERVER_URL } from "@/lib/serverUrl";
import toast from "react-hot-toast";

const STATUT: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE: { color:"#EE813D", bg:"rgba(238,129,61,0.1)",  label:"En attente" },
  VUE:        { color:"#2284C0", bg:"rgba(34,132,192,0.1)",  label:"Vue"        },
  ENTRETIEN:  { color:"#7C3AED", bg:"rgba(124,58,237,0.1)",  label:"Entretien"  },
  ACCEPTE:    { color:"#1A9E6F", bg:"rgba(26,158,111,0.1)",  label:"Accepté"    },
  REFUSE:     { color:"#D64045", bg:"rgba(214,64,69,0.1)",   label:"Refusé"     },
};

const LANG_LEVEL: Record<string, string> = {
  Débutant:"A1-A2", Intermédiaire:"B1-B2", Avancé:"C1", Bilingue:"C1-C2", Natif:"Natif",
};

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
      {icon && <span style={{ color:"#5A7A96" }}>{icon}</span>}
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>{children}</div>
    </div>
  );
}

export function CandidatDetailModal({ candidatId, onClose }: { candidatId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: candidat, isLoading } = useQuery({
    queryKey: ["admin-candidat", candidatId],
    queryFn:  () => adminApi.getCandidatById(candidatId).then(r => r.data),
    staleTime: 5 * 60_000,
  });

  const note = candidat?.adminNote;

  const [compteRendu, setCompteRendu] = useState("");
  const [crEditing,   setCrEditing]   = useState(false);

  if (note?.compteRendu && !crEditing && compteRendu === "") {
    setCompteRendu(note.compteRendu);
  }

  const noteMut = useMutation({
    mutationFn: (data: { qualifie?: boolean; compteRendu?: string; pieceJointeUrl?: string; accompagnement?: boolean | null; }) =>
      adminApi.upsertCandidatNote(candidatId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidat", candidatId] });
      qc.invalidateQueries({ queryKey: ["admin-candidats"] });
      toast.success("Sauvegardé");
    },
    onError: () => toast.error("Erreur"),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => adminApi.uploadCandidatNoteFile(candidatId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidat", candidatId] });
      toast.success("Document importé");
    },
    onError: () => toast.error("Erreur lors de l'import"),
  });

  const avatarSrc = resolveAvatarUrl(candidat?.avatarUrl);

  return (
    <Modal title="Profil candidat" onClose={onClose} wide>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .cdm-hero      { display:flex; gap:14px; align-items:flex-start; }
        .cdm-hero-meta { display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }
        .cdm-stats     { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
        .cdm-exp-row   { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .cdm-cand-row  { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .cdm-skill-row {
          display:flex;
          flex-direction:column;
          gap:6px;
          padding:10px 12px;
          background:#F7F8FA;
          border-radius:10px;
          border:1px solid rgba(16,64,107,0.06);
        }
        .cdm-skill-top {
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:10px;
        }
        .cdm-skill-label {
          font-size:12px;
          font-weight:600;
          color:#0D2137;
          line-height:1.4;
        }
        .cdm-skill-pct {
          font-size:11px;
          font-weight:700;
          color:#2284C0;
          flex-shrink:0;
          white-space:nowrap;
        }
        .cdm-skill-bar-track {
          height:6px;
          border-radius:99px;
          background:rgba(16,64,107,0.08);
          overflow:hidden;
        }
        .cdm-skill-bar-fill {
          height:100%;
          border-radius:99px;
          background:linear-gradient(90deg,#10406B,#2284C0);
        }
        @media(max-width:520px) {
          .cdm-hero      { flex-direction:column; }
          .cdm-stats     { grid-template-columns:repeat(2,1fr); }
          .cdm-exp-row   { flex-direction:column; gap:4px; }
          .cdm-cand-row  { flex-direction:column; gap:6px; }
          .cdm-skill-label { width:80px; font-size:11px; }
        }
      `}</style>

      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) uploadMut.mutate(f);
          e.target.value = "";
        }}
      />

      {isLoading || !candidat ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, gap:12 }}>
          <Loader2 size={22} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
          <span style={{ color:"#5A7A96", fontSize:14 }}>Chargement…</span>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* ── Hero ── */}
          <div style={{ background:"linear-gradient(135deg,#10406B 0%,#2284C0 100%)", borderRadius:14, padding:"20px" }}>
            <div className="cdm-hero">
              <div style={{ flexShrink:0 }}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar"
                    style={{ width:60, height:60, borderRadius:14, objectFit:"cover", border:"2px solid rgba(255,255,255,0.3)" }}
                    onError={e => { (e.target as HTMLImageElement).style.display="none"; }}
                  />
                ) : (
                  <div style={{ width:60, height:60, borderRadius:14, background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif" }}>
                    {candidat.prenom.charAt(0)}{candidat.nom.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"clamp(16px,4vw,20px)", fontWeight:800, color:"white", fontFamily:"'Fraunces',serif", lineHeight:1.2 }}>
                  {candidat.prenom} {candidat.nom}
                </div>
                {candidat.titre && (
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:3 }}>{candidat.titre}</div>
                )}
                <div className="cdm-hero-meta">
                  {candidat.utilisateur?.email && (
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center", gap:3 }}>
                      <Mail size={10}/>{candidat.utilisateur.email}
                    </span>
                  )}
                  {candidat.telephone && (
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center", gap:3 }}>
                      <Phone size={10}/>{candidat.telephone}
                    </span>
                  )}
                  {candidat.localisation && (
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center", gap:3 }}>
                      <MapPin size={10}/>{candidat.localisation}
                    </span>
                  )}
                </div>
              </div>

              {candidat.cvUrl && (
                <a href={`${SERVER_URL}${candidat.cvUrl}`} target="_blank" rel="noreferrer"
                  style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"white", fontSize:11, fontWeight:600, textDecoration:"none" }}>
                  <Download size={12}/> CV
                </a>
              )}
            </div>

            {/* ── Profil qualifié — below hero row, full width, no overlap ── */}
            <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.15)", display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", }}>
              <button
                onClick={() => noteMut.mutate({ qualifie: !(note?.qualifie ?? false) })}
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"9px 20px", borderRadius:99, cursor:"pointer",
                  border:`2px solid ${note?.qualifie ? "#4ADE80" : "rgba(255,255,255,0.3)"}`,
                  background: note?.qualifie ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.08)",
                  color: note?.qualifie ? "#4ADE80" : "rgba(255,255,255,0.7)",
                  fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700,
                  transition:"all 0.2s",
                }}
              >
                <ShieldCheck size={15}/>
                {note?.qualifie ? "Profil qualifié ✓" : "Qualifier ce profil"}
              </button>
              {/* Accompagnement */}
              <button
                onClick={() =>
                  noteMut.mutate({
                    accompagnement: !(note?.accompagnement ?? false),
                  })
                }
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:8,
                  padding:"9px 20px",
                  borderRadius:99,
                  cursor:"pointer",
                  border:`2px solid ${
                    note?.accompagnement
                      ? "#F59E0B"
                      : "rgba(255,255,255,0.3)"
                  }`,
                  background: note?.accompagnement
                    ? "rgba(245,158,11,0.2)"
                    : "rgba(255,255,255,0.08)",
                  color: note?.accompagnement
                    ? "#FBBF24"
                    : "rgba(255,255,255,0.7)",
                  fontFamily:"'DM Sans',sans-serif",
                  fontSize:13,
                  fontWeight:700,
                  transition:"all 0.2s",
                }}
              >
                <UserCheck size={15} />
                {note?.accompagnement
                  ? "Accompagnement ✓"
                  : "Mettre en accompagnement"}
            </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="cdm-stats">
            {[
              { label:"Formations",   value:candidat.formations?.length   ?? 0, color:"#7C3AED" },
              { label:"Expériences",  value:candidat.experiences?.length  ?? 0, color:"#EE813D" },
              { label:"Compétences",  value:candidat.competences?.length  ?? 0, color:"#1A9E6F" },
              { label:"Candidatures", value:candidat.candidatures?.length ?? 0, color:"#2284C0" },
            ].map(s => (
              <div key={s.label} style={{ background:"#F7F8FA", borderRadius:10, padding:"12px 8px", textAlign:"center", border:"1px solid rgba(16,64,107,0.07)" }}>
                <div style={{ fontSize:"clamp(18px,4vw,22px)", fontWeight:900, color:s.color, fontFamily:"'Fraunces',serif" }}>{s.value}</div>
                <div style={{ fontSize:10, color:"#5A7A96", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Bio ── */}
          {candidat.bio && (
            <div>
              <SectionTitle>À propos</SectionTitle>
              <p style={{ fontSize:13, color:"#3D5A73", lineHeight:1.75, margin:0 }}>{candidat.bio}</p>
            </div>
          )}

          {/* ── Formations ── */}
          {(candidat.formations?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<GraduationCap size={12}/>}>Formations</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {candidat.formations!.map(f => (
                  <div key={f.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, padding:"10px 14px", background:"#F7F8FA", borderRadius:10, border:"1px solid rgba(16,64,107,0.06)" }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#0D2137", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.diplome}</div>
                      <div style={{ fontSize:12, color:"#5A7A96" }}>{f.ecole}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#2284C0", flexShrink:0 }}>{f.annee}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Expériences ── */}
          {(candidat.experiences?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Briefcase size={12}/>}>Expériences</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {candidat.experiences!.map(exp => (
                  <div key={exp.id} style={{ padding:"12px 14px", background:"#F7F8FA", borderRadius:10, border:"1px solid rgba(16,64,107,0.06)", borderLeft:"3px solid #2284C0" }}>
                    <div className="cdm-exp-row">
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0D2137" }}>{exp.poste}</div>
                        <div style={{ fontSize:12, color:"#2284C0", fontWeight:600, display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                          <Building2 size={10}/>{exp.entreprise}
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:3, flexShrink:0, whiteSpace:"nowrap" }}>
                        <Calendar size={10}/>
                        {exp.dateDebut} → {exp.actuel ? "Présent" : (exp.dateFin ?? "?")}
                      </div>
                    </div>
                    {exp.description && (
                      <p style={{ fontSize:12, color:"#5A7A96", margin:"8px 0 0", lineHeight:1.6 }}>{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Compétences ── */}
          {(candidat.competences?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Star size={12}/>}>Compétences</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {candidat.competences!.map(c => (
                  <div key={c.competenceId} className="cdm-skill-row">
                    <div className="cdm-skill-top">
                      <div className="cdm-skill-label">{c.competence.nom}</div>
                      <div className="cdm-skill-pct">{c.niveau}%</div>
                    </div>
                    <div className="cdm-skill-bar-track">
                      <div className="cdm-skill-bar-fill" style={{ width:`${c.niveau}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Langues ── */}
          {(candidat.langues?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Globe size={12}/>}>Langues</SectionTitle>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {candidat.langues!.map(l => (
                  <div key={l.id} style={{ padding:"7px 12px", borderRadius:9, background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:"#0D2137" }}>{l.nom}</span>
                    <span style={{ fontSize:10, color:"#5A7A96", background:"rgba(16,64,107,0.06)", padding:"2px 7px", borderRadius:5 }}>
                      {LANG_LEVEL[l.niveau] ?? l.niveau}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Rémunération ── */}
          {(candidat.salaireActuel || candidat.pretentionsSalariales || candidat.primes || candidat.vehiculeFonction || candidat.vehiculeService || (candidat.avantagesSociaux?.length ?? 0) > 0) && (
            <div>
              <SectionTitle icon={<DollarSign size={12}/>}>Rémunération</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {candidat.salaireActuel && (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"#F7F8FA", borderRadius:10, border:"1px solid rgba(16,64,107,0.06)" }}>
                    <span style={{ fontSize:12, color:"#5A7A96" }}>Salaire actuel/dernier</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#0D2137" }}>{candidat.salaireActuel}</span>
                  </div>
                )}
                {candidat.pretentionsSalariales && (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"#F7F8FA", borderRadius:10, border:"1px solid rgba(16,64,107,0.06)" }}>
                    <span style={{ fontSize:12, color:"#5A7A96" }}>Prétentions salariales</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#1A9E6F" }}>{candidat.pretentionsSalariales}</span>
                  </div>
                )}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[
                    { label:"Primes",               value:candidat.primes           },
                    { label:"Véhicule de fonction",  value:candidat.vehiculeFonction },
                    { label:"Véhicule de service",   value:candidat.vehiculeService  },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:99, background: value ? "rgba(26,158,111,0.08)" : "rgba(16,64,107,0.04)", border:`1px solid ${value ? "rgba(26,158,111,0.2)" : "rgba(16,64,107,0.1)"}` }}>
                      <span style={{ fontSize:12, color: value ? "#1A9E6F" : "#B0C4D4", fontWeight:600 }}>{value ? "✓" : "✗"}</span>
                      <span style={{ fontSize:12, color:"#5A7A96" }}>{label}</span>
                    </div>
                  ))}
                </div>
                {(candidat.avantagesSociaux?.length ?? 0) > 0 && (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {candidat.avantagesSociaux!.map(a => (
                      <span key={a} style={{ padding:"4px 10px", borderRadius:99, background:"rgba(34,132,192,0.08)", border:"1px solid rgba(34,132,192,0.15)", color:"#2284C0", fontSize:12, fontWeight:600 }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Candidatures ── */}
          <div>
            <SectionTitle icon={<Briefcase size={12}/>}>
              Offres postulées ({candidat.candidatures?.length ?? 0})
            </SectionTitle>
            {(candidat.candidatures?.length ?? 0) === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"#B0C4D4", fontSize:13 }}>Aucune candidature.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {candidat.candidatures!.map(cand => {
                  const sc = STATUT[cand.statut] ?? STATUT.EN_ATTENTE;
                  return (
                    <div key={cand.id} style={{ padding:"12px 14px", background:"white", borderRadius:12, border:"1px solid rgba(16,64,107,0.08)", boxShadow:"0 1px 4px rgba(16,64,107,0.05)" }}>
                      <div className="cdm-cand-row">
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:13, color:"#0D2137", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {cand.offre?.titre ?? `Offre #${cand.offreId}`}
                          </div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {cand.offre?.entreprise?.nom && (
                              <span style={{ fontSize:11, color:"#2284C0", fontWeight:600, display:"flex", alignItems:"center", gap:3 }}>
                                <Building2 size={9}/>{cand.offre.entreprise.nom}
                              </span>
                            )}
                            {cand.offre?.type_contrat && <span style={{ fontSize:11, color:"#5A7A96" }}>{cand.offre.type_contrat}</span>}
                            {cand.offre?.localisation && (
                              <span style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:3 }}>
                                <MapPin size={9}/>{cand.offre.localisation}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
                          <span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, whiteSpace:"nowrap" }}>{sc.label}</span>
                          <span style={{ fontSize:10, color:"#B0C4D4", display:"flex", alignItems:"center", gap:3 }}>
                            <Calendar size={9}/>{new Date(cand.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                      {cand.lettre && (
                        <div style={{ marginTop:10, padding:"9px 12px", background:"#F7F8FA", borderRadius:8, fontSize:12, color:"#5A7A96", lineHeight:1.6, borderLeft:"3px solid rgba(34,132,192,0.3)" }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#B0C4D4", marginBottom:4 }}>Lettre de motivation</div>
                          {cand.lettre.length > 200 ? cand.lettre.slice(0,200)+"…" : cand.lettre}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Admin section ── */}
          <div style={{ borderTop:"2px dashed rgba(16,64,107,0.1)", paddingTop:20, display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#B0C4D4" }}>
              Section interne — Admin uniquement
            </div>

            {/* ── Pièce jointe ── */}
            <div>
              <SectionTitle icon={<FileText size={12}/>}>Évaluation / Pièce jointe</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {note?.pieceJointeUrl ? (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"rgba(34,132,192,0.04)", border:"1px solid rgba(34,132,192,0.15)", borderRadius:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <FileText size={16} color="#2284C0"/>
                      <span style={{ fontSize:13, color:"#2284C0", fontWeight:600 }}>Document joint</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <a
                        href={`${SERVER_URL}${note.pieceJointeUrl}`}
                        target="_blank" rel="noreferrer"
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, background:"rgba(34,132,192,0.1)", color:"#2284C0", fontSize:12, fontWeight:600, textDecoration:"none" }}
                      >
                        <Download size={12}/> Télécharger
                      </a>
                      <button
                        onClick={() => fileRef.current?.click()}
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, background:"rgba(238,129,61,0.08)", border:"1px solid rgba(238,129,61,0.2)", color:"#EE813D", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                      >
                        <Upload size={12}/> Remplacer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadMut.isPending}
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:10, border:"2px dashed rgba(16,64,107,0.15)", background:"#FAFAF8", color:"#5A7A96", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#2284C0"; (e.currentTarget as HTMLElement).style.color="#2284C0"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(16,64,107,0.15)"; (e.currentTarget as HTMLElement).style.color="#5A7A96"; }}
                  >
                    {uploadMut.isPending
                      ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Import…</>
                      : <><Upload size={14}/> Importer un document d'évaluation</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* ── Compte rendu ── */}
            <div>
              <SectionTitle icon={<ClipboardList size={12}/>}>Compte rendu d'entretien</SectionTitle>
              <textarea
                value={compteRendu}
                onChange={e => { setCompteRendu(e.target.value); setCrEditing(true); }}
                placeholder="Rédigez ici vos notes d'entretien, observations, points forts, points faibles…"
                style={{ width:"100%", minHeight:140, padding:"12px 14px", borderRadius:10, border:"1.5px solid rgba(16,64,107,0.12)", outline:"none", fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"#FAFAF8", resize:"vertical", boxSizing:"border-box", lineHeight:1.65 }}
                onFocus={e => (e.target.style.borderColor="#2284C0")}
                onBlur={e  => (e.target.style.borderColor="rgba(16,64,107,0.12)")}
              />
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8, gap:8 }}>
                {crEditing && compteRendu !== (note?.compteRendu ?? "") && (
                  <button
                    onClick={() => { setCompteRendu(note?.compteRendu ?? ""); setCrEditing(false); }}
                    style={{ padding:"8px 14px", borderRadius:9, background:"transparent", border:"1px solid rgba(16,64,107,0.12)", color:"#5A7A96", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={() => { noteMut.mutate({ compteRendu }); setCrEditing(false); }}
                  disabled={noteMut.isPending || compteRendu === (note?.compteRendu ?? "")}
                  style={{ padding:"8px 16px", borderRadius:9, background: noteMut.isPending || compteRendu === (note?.compteRendu ?? "") ? "rgba(16,64,107,0.1)" : "linear-gradient(135deg,#10406B,#2284C0)", border:"none", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", opacity: compteRendu === (note?.compteRendu ?? "") ? 0.4 : 1 }}
                >
                  {noteMut.isPending ? "Sauvegarde…" : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
}