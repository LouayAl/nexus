// frontend/src/app/profile/_components/TabsPanel.tsx
"use client";

import { Star, Briefcase, Award, Globe2, Plus, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type CandidatProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { SKILL_COLORS, LANGUE_NIVEAU_COLORS, skillLevelLabel } from "./types";

type Tab = "skills" | "experience" | "formation" | "langues";

interface Props {
  profile:      CandidatProfile;
  tab:          Tab;
  onTabChange:  (t: Tab) => void;
  onAddSkill:   () => void;
  onAddExp:     () => void;
  onAddForm:    () => void;
  onAddLang:    () => void;
  onEditExp:    (item: any) => void;
  onEditForm:   (item: any) => void;
  onEditLang:   (item: any) => void;
}

export function TabsPanel({
  profile, tab, onTabChange,
  onAddSkill, onAddExp, onAddForm, onAddLang,
  onEditExp, onEditForm, onEditLang,
}: Props) {
  const qc     = useQueryClient();
  const skills = profile.competences ?? [];
  const exps   = profile.experiences ?? [];
  const forms  = profile.formations  ?? [];
  const langs  = profile.langues     ?? [];

  const tabs = [
    { key:"skills" as Tab,     label:"Compétences", icon:Star,     count:skills.length },
    { key:"experience" as Tab, label:"Expérience",  icon:Briefcase,count:exps.length   },
    { key:"formation" as Tab,  label:"Formation",   icon:Award,    count:forms.length  },
    { key:"langues" as Tab,    label:"Langues",     icon:Globe2,   count:langs.length  },
  ];

  const addBtn = (onClick: () => void) => (
    <button onClick={onClick} className="tabs-add-btn">
      <Plus size={13}/> <span className="tabs-add-label">Ajouter</span>
    </button>
  );

  const sectionHeader = (label: string, btn: React.ReactNode) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>{label}</div>
      {btn}
    </div>
  );

  const empty = (icon: React.ReactNode, text: string) => (
    <div style={{ textAlign:"center", padding:"40px 0", color:"#B0C4D4" }}>
      {icon}
      <div style={{ fontSize:14, marginTop:8 }}>{text}</div>
    </div>
  );

  return (
    <>
      <style>{`
        .tabs-panel { background:white; border:1px solid rgba(16,64,107,0.08); border-radius:20px; padding:32px; box-shadow:0 2px 12px rgba(16,64,107,0.06); }
        .tabs-add-btn { display:flex; align-items:center; gap:5px; background:rgba(34,132,192,0.08); border:none; color:#2284C0; font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px; cursor:pointer; font-family:'DM Sans',sans-serif; white-space:nowrap; }
        .tabs-tab { flex:1; padding:9px 12px; border-radius:9px; border:none; font-size:12px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.18s; }
        .tabs-tab-label { display:inline; }
        .tabs-tab-count { font-size:10px; font-weight:700; padding:1px 6px; border-radius:99px; }
        .tabs-exp-row { display:flex; gap:16px; }
        .tabs-exp-connector { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
        .tabs-exp-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px; gap:8px; }
        .tabs-exp-actions { display:flex; gap:6px; align-items:center; flex-shrink:0; }
        .tabs-exp-date { font-size:11px; color:#5A7A96; background:#F7F8FA; padding:3px 10px; border-radius:8px; }
        .tabs-lang-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; }

        @media (max-width: 480px) {
          .tabs-panel { padding:20px 16px; border-radius:14px; }
          .tabs-tab-label { display:none; }
          .tabs-tab-count { display:none; }
          .tabs-tab { padding:9px 8px; }
          .tabs-exp-connector { display:none; }
          .tabs-exp-row { gap:0; }
          .tabs-exp-header { flex-direction:column; align-items:flex-start; gap:6px; }
          .tabs-exp-actions { align-self:flex-start; }
          .tabs-lang-grid { grid-template-columns:1fr; }
          .tabs-add-label { display:none; }
          .tabs-add-btn { padding:6px 8px; }
        }

        @media (min-width:481px) and (max-width:640px) {
          .tabs-panel { padding:24px 20px; }
          .tabs-exp-connector { display:none; }
          .tabs-exp-row { gap:0; }
          .tabs-exp-header { flex-wrap:wrap; gap:6px; }
        }
      `}</style>

      <div className="tabs-panel">

        {/* Tab bar */}
        <div style={{ display:"flex", gap:4, marginBottom:28, background:"#F7F8FA", borderRadius:12, padding:4 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className="tabs-tab"
              style={{
                background: tab===t.key ? "white" : "transparent",
                color:      tab===t.key ? "#10406B" : "#5A7A96",
                boxShadow:  tab===t.key ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
              }}
            >
              <t.icon size={13}/>
              <span className="tabs-tab-label">{t.label}</span>
              {t.count > 0 && (
                <span className="tabs-tab-count" style={{ background:tab===t.key?"#10406B":"#E8EDF2", color:tab===t.key?"white":"#5A7A96" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Skills ── */}
        {tab === "skills" && (
          <div>
            {sectionHeader("Compétences techniques", addBtn(onAddSkill))}
            {skills.length === 0
              ? empty(<Star size={32} style={{ opacity:0.4 }}/>, "Aucune compétence ajoutée")
              : skills.map(({ competence, niveau }, i) => (
                <div key={competence.id} style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"#0D2137" }}>{competence.nom}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:SKILL_COLORS[i%SKILL_COLORS.length] }}>
                        {niveau}% ({skillLevelLabel(niveau)})
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            await candidatsApi.deleteSkill(competence.id);
                            qc.invalidateQueries({ queryKey:["profile"] });
                            toast.success("Compétence supprimée");
                          } catch { toast.error("Erreur lors de la suppression"); }
                        }}
                        style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}
                      >
                        <Trash2 size={13} color="#D64045"/>
                      </button>
                    </div>
                  </div>
                  <div style={{ height:8, background:"#F0F4F8", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${niveau}%`, borderRadius:4, background:`linear-gradient(90deg, ${SKILL_COLORS[i%SKILL_COLORS.length]}80, ${SKILL_COLORS[i%SKILL_COLORS.length]})`, transition:"width 0.6s" }}/>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── Experience ── */}
        {tab === "experience" && (
          <div>
            {sectionHeader("Expérience professionnelle", addBtn(onAddExp))}
            {exps.length === 0
              ? empty(<Briefcase size={32} style={{ opacity:0.4 }}/>, "Aucune expérience ajoutée")
              : exps.map((exp, i) => {
                const color = SKILL_COLORS[i%SKILL_COLORS.length];
                return (
                  <div key={exp.id} className="tabs-exp-row" style={{ marginBottom:i<exps.length-1?28:0 }}>
                    <div className="tabs-exp-connector">
                      <div style={{ width:12, height:12, borderRadius:"50%", background:color, marginTop:4, boxShadow:`0 0 0 4px ${color}20` }}/>
                      {i < exps.length-1 && <div style={{ width:2, flex:1, background:"rgba(16,64,107,0.07)", marginTop:8, borderRadius:1 }}/>}
                    </div>
                    <div style={{ flex:1, paddingBottom:i<exps.length-1?8:0 }}>
                      <div className="tabs-exp-header">
                        <div className="font-display" style={{ fontSize:15, fontWeight:700, color:"#0D2137" }}>{exp.poste}</div>
                        <div className="tabs-exp-actions">
                          <span className="tabs-exp-date">
                            {exp.dateDebut} – {exp.actuel ? "Présent" : (exp.dateFin ?? "?")}
                          </span>
                          <button onClick={() => onEditExp(exp)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Edit2 size={12} color="#5A7A96"/></button>
                          <button onClick={async () => { try { await candidatsApi.deleteExperience(exp.id); qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Supprimé"); } catch { toast.error("Erreur"); } }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Trash2 size={12} color="#D64045"/></button>
                        </div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color, marginBottom:4 }}>{exp.entreprise}</div>
                      {exp.description && <div style={{ fontSize:13, color:"#5A7A96", lineHeight:1.6 }}>{exp.description}</div>}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ── Formation ── */}
        {tab === "formation" && (
          <div>
            {sectionHeader("Formation", addBtn(onAddForm))}
            {forms.length === 0
              ? empty(<Award size={32} style={{ opacity:0.4 }}/>, "Aucune formation ajoutée")
              : forms.map((f, i) => {
                const color = SKILL_COLORS[i%SKILL_COLORS.length];
                return (
                  <div key={f.id} style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:14, padding:"16px 20px", marginBottom:12, borderLeft:`4px solid ${color}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                    <div style={{ minWidth:0 }}>
                      <div className="font-display" style={{ fontSize:15, fontWeight:700, color:"#0D2137", marginBottom:4 }}>{f.diplome}</div>
                      <div style={{ fontSize:13, color:"#5A7A96" }}>{f.ecole} · {f.annee}</div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={() => onEditForm(f)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Edit2 size={12} color="#5A7A96"/></button>
                      <button onClick={async () => { try { await candidatsApi.deleteFormation(f.id); qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Supprimé"); } catch { toast.error("Erreur"); } }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Trash2 size={12} color="#D64045"/></button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ── Langues ── */}
        {tab === "langues" && (
          <div>
            {sectionHeader("Langues", addBtn(onAddLang))}
            {langs.length === 0
              ? empty(<Globe2 size={32} style={{ opacity:0.4 }}/>, "Aucune langue ajoutée")
              : (
                <div className="tabs-lang-grid">
                  {langs.map(l => {
                    const color = LANGUE_NIVEAU_COLORS[l.niveau] ?? "#5A7A96";
                    return (
                      <div key={l.id} style={{ background:"#F7F8FA", border:`1px solid ${color}25`, borderRadius:14, padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15, color:"#0D2137", marginBottom:4 }}>{l.nom}</div>
                          <span style={{ background:`${color}15`, color, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:99 }}>{l.niveau}</span>
                        </div>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={() => onEditLang(l)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Edit2 size={12} color="#5A7A96"/></button>
                          <button onClick={async () => { try { await candidatsApi.deleteLangue(l.id); qc.invalidateQueries({ queryKey:["profile"] }); toast.success("Supprimé"); } catch { toast.error("Erreur"); } }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}><Trash2 size={12} color="#D64045"/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}
      </div>
    </>
  );
}