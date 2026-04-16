// frontend/src/app/admin/components/CandidatDetailModal.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Mail, Phone, Briefcase, GraduationCap, Globe,
  Star, FileText, Loader2, Calendar, Building2, ExternalLink, Download,
} from "lucide-react";
import { Modal } from "./Modal";
import { adminApi } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/avatar";
import { SERVER_URL } from "@/lib/serverUrl";

const STATUT: Record<string, { color: string; bg: string; label: string }> = {
  EN_ATTENTE: { color:"#EE813D", bg:"rgba(238,129,61,0.1)",  label:"En attente" },
  VUE:        { color:"#2284C0", bg:"rgba(34,132,192,0.1)",  label:"Vue"        },
  ENTRETIEN:  { color:"#7C3AED", bg:"rgba(124,58,237,0.1)",  label:"Entretien"  },
  ACCEPTE:    { color:"#1A9E6F", bg:"rgba(26,158,111,0.1)",  label:"Accepté"    },
  REFUSE:     { color:"#D64045", bg:"rgba(214,64,69,0.1)",   label:"Refusé"     },
};

const LANG_LEVEL: Record<string, string> = {
  Débutant:"A1-A2", Intermédiaire:"B1-B2", Avancé:"C1", Natif:"Natif",
};

// const API = process.env.NEXT_PUBLIC_API_URL?.replace("/api","") ?? "http://localhost:3001";

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
      {icon && <span style={{ color:"#5A7A96" }}>{icon}</span>}
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>{children}</div>
    </div>
  );
}

export function CandidatDetailModal({ candidatId, onClose }: { candidatId: number; onClose: () => void }) {
  const { data: candidat, isLoading } = useQuery({
    queryKey: ["admin-candidat", candidatId],
    queryFn:  () => adminApi.getCandidatById(candidatId).then(r => r.data),
    staleTime: 5 * 60_000,
  });
  const avatarSrc = resolveAvatarUrl(candidat?.avatarUrl);

  return (
    <Modal title="Profil candidat" onClose={onClose} wide>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .cdm-hero        { display:flex; gap:14px; align-items:flex-start; }
        .cdm-hero-meta   { display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }
        .cdm-stats       { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
        .cdm-exp-row     { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .cdm-cand-row    { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .cdm-skill-row   { display:flex; align-items:center; gap:10px; }
        .cdm-skill-label { width:100px; font-size:12px; font-weight:600; color:#0D2137; flex-shrink:0; }

        @media(max-width:520px) {
          .cdm-hero        { flex-direction:column; }
          .cdm-hero-meta   { flex-direction:column; gap:5px; }
          .cdm-stats       { grid-template-columns:repeat(2,1fr); }
          .cdm-exp-row     { flex-direction:column; gap:4px; }
          .cdm-cand-row    { flex-direction:column; gap:6px; }
          .cdm-skill-label { width:80px; font-size:11px; }
        }
      `}</style>

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

              {/* Avatar or photo */}
              <div style={{ flexShrink:0 }}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar"
                    style={{ width:60, height:60, borderRadius:14, objectFit:"cover", border:"2px solid rgba(255,255,255,0.3)" }}
                    onError={e => { (e.target as HTMLImageElement).style.display="none"; }}
                  />
                ) : (
                  <div style={{ width:60, height:60, borderRadius:14, background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif", flexShrink:0 }}>
                    {candidat.prenom.charAt(0)}{candidat.nom.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
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

              {/* CV button */}
              {candidat.cvUrl && (
                <a href={`${SERVER_URL}${candidat.cvUrl}`} target="_blank" rel="noreferrer" style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"white", fontSize:11, fontWeight:600, textDecoration:"none" }}>
                  <Download size={12}/> CV
                </a>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="cdm-stats">
            {[
              { label:"Candidatures", value:candidat.candidatures?.length ?? 0, color:"#2284C0" },
              { label:"Compétences",  value:candidat.competences?.length  ?? 0, color:"#1A9E6F" },
              { label:"Expériences",  value:candidat.experiences?.length  ?? 0, color:"#EE813D" },
              { label:"Formations",   value:candidat.formations?.length   ?? 0, color:"#7C3AED" },
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

          {/* ── Compétences ── */}
          {(candidat.competences?.length ?? 0) > 0 && (
            <div>
              <SectionTitle icon={<Star size={12}/>}>Compétences</SectionTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {candidat.competences!.map(c => (
                  <div key={c.competenceId} className="cdm-skill-row">
                    <div className="cdm-skill-label">{c.competence.nom}</div>
                    <div style={{ flex:1, height:6, borderRadius:99, background:"rgba(16,64,107,0.08)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${c.niveau}%`, background:"linear-gradient(90deg,#10406B,#2284C0)" }}/>
                    </div>
                    <div style={{ fontSize:11, color:"#5A7A96", width:30, textAlign:"right", flexShrink:0 }}>{c.niveau}%</div>
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

          {/* ── Candidatures ── */}
          <div>
            <SectionTitle icon={<Briefcase size={12}/>}>
              Offres postulées ({candidat.candidatures?.length ?? 0})
            </SectionTitle>
            {(candidat.candidatures?.length ?? 0) === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"#B0C4D4", fontSize:13 }}>
                Aucune candidature pour le moment.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {candidat.candidatures!.map(cand => {
                  const sc = STATUT[cand.statut] ?? STATUT.EN_ATTENTE;
                  return (
                    <div key={cand.id} style={{ padding:"12px 14px", background:"white", borderRadius:12, border:"1px solid rgba(16,64,107,0.08)", boxShadow:"0 1px 4px rgba(16,64,107,0.05)" }}>
                      <div className="cdm-cand-row">
                        {/* Left: offer info */}
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
                            {cand.offre?.type_contrat && (
                              <span style={{ fontSize:11, color:"#5A7A96" }}>{cand.offre.type_contrat}</span>
                            )}
                            {cand.offre?.localisation && (
                              <span style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:3 }}>
                                <MapPin size={9}/>{cand.offre.localisation}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Right: status + date */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
                          <span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, whiteSpace:"nowrap" }}>
                            {sc.label}
                          </span>
                          <span style={{ fontSize:10, color:"#B0C4D4", display:"flex", alignItems:"center", gap:3 }}>
                            <Calendar size={9}/>
                            {new Date(cand.createdAt).toLocaleDateString("fr-FR")}
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

        </div>
      )}
    </Modal>
  );
}
