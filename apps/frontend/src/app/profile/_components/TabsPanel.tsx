// frontend/src/app/profile/_components/TabsPanel.tsx
"use client";

import { Star, Briefcase, Award, Globe2, Plus, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type CandidatProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { SKILL_COLORS, LANGUE_NIVEAU_COLORS, skillLevelLabel, skillColor } from "./types";
import { PROFILE_COPY } from "./copy";
import type { AppLanguage } from "@/hooks/useAppLanguage";

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
  language:     AppLanguage;
}

export function TabsPanel({
  profile, tab, onTabChange,
  onAddSkill, onAddExp, onAddForm, onAddLang,
  onEditExp, onEditForm, onEditLang, language,
}: Props) {
  const qc     = useQueryClient();
  const copy   = PROFILE_COPY[language];
  const skills = profile.competences ?? [];
  const exps   = profile.experiences ?? [];
  const forms = (profile.formations ?? []).slice().sort((a, b) => {
    const getEndYear = (annee?: string) => {
      if (!annee) return 0;

      // handles "2018-2019"
      const parts = annee.split("-");
      return Number(parts[parts.length - 1]);
    };

    return getEndYear(b.annee) - getEndYear(a.annee);
  });
  const langs  = profile.langues     ?? [];

  const tabs = [
    { key: "formation"  as Tab, label: copy.tabs.formation,  icon: Award,     count: forms.length  },
    { key: "experience" as Tab, label: copy.tabs.experience, icon: Briefcase, count: exps.length   },
    { key: "skills"     as Tab, label: copy.tabs.skills,     icon: Star,      count: skills.length },
    { key: "langues"    as Tab, label: copy.tabs.langues,    icon: Globe2,    count: langs.length  },
  ];

  const addBtn = (onClick: () => void) => (
    <button onClick={onClick} className="tp-add-btn">
      <Plus size={13}/><span className="tp-add-label">{copy.add}</span>
    </button>
  );

  const sectionHeader = (label: string, btn: React.ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#0D2137" }}>{label}</div>
      {btn}
    </div>
  );

  const empty = (icon: React.ReactNode, text: string) => (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#B0C4D4" }}>
      {icon}
      <div style={{ fontSize: 13, marginTop: 10 }}>{text}</div>
    </div>
  );

  return (
    <>
      <style>{`
        /* ── Card shell ── */
        .tp-card {
          position: relative;
          border-radius: 20px;
          background: #ffffff;
          padding: 1px; /* important for border thickness */

          background: linear-gradient(
            90deg,
            #ed823b,
            #10406B,
            #ed823b
          );

          background-size: 300% 300%;
          animation: tpBorderRotate 6s linear infinite;

          box-shadow:
            0 1px 3px rgba(16,64,107,0.06),
            0 8px 24px rgba(16,64,107,0.07);

          display: flex;
          flex-direction: column;
        }

        @keyframes tpBorderRotate {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 300% 50%;
          }
        }

        .tp-card::before {
          content: "";
          position: absolute;
          inset: 2px;
          background: white;
          border-radius: 19px;
          z-index: 0;
        }

        .tp-card > * {
          position: relative;
          z-index: 1;
        }
        .tp-card:hover {
          box-shadow:
            0 1px 3px rgba(16,64,107,0.07),
            0 12px 32px rgba(16,64,107,0.10);
        }

        /* Navy top accent */
        .tp-topline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 20px 20px 0 0;
          z-index: 2;
        }

        /* Padding wrapper */
        .tp-inner {
          padding: 28px;
          display: flex;
          flex-direction: column;
          /* Fixed height — content scrolls, card never grows */
          height: 800px;
        }

        /* ── Tab bar ── */
        .tp-tabbar {
          display: flex;
          gap: 4px;
          background: #F7F8FA;
          border-radius: 12px;
          padding: 4px;
          flex-shrink: 0;
          margin-bottom: 24px;
          border: 1px solid rgba(16,64,107,0.07);
        }

        .tp-tab {
          flex: 1;
          padding: 8px 10px;
          border-radius: 9px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          background: transparent;
          color: #5A7A96;
        }
        .tp-tab:hover:not(.tp-tab-active) {
          background: rgba(16,64,107,0.05);
          color: #10406B;
        }
        .tp-tab-active {
          background: linear-gradient(180deg, #ed823b 0%, #f4a068 100%);
          color: #ffffff;
          box-shadow: 0 3px 12px rgba(16,64,107,0.25);
        }

        .tp-tab-label { display: inline; }

        .tp-tab-count {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 99px;
        }
        .tp-tab-active .tp-tab-count {
          background: rgba(255,255,255,0.22);
          color: #fff;
        }
        .tp-tab:not(.tp-tab-active) .tp-tab-count {
          background: rgba(16,64,107,0.08);
          color: #5A7A96;
        }

        /* ── Scrollable content — fixed height, scrolls inside ── */
        .tp-scroll {
          flex: 1;
          min-height: 0;          /* critical: lets flex child shrink below content size */
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 6px;
          margin-right: -6px;
        }
        .tp-scroll::-webkit-scrollbar { width: 4px; }
        .tp-scroll::-webkit-scrollbar-track { background: transparent; }
        .tp-scroll::-webkit-scrollbar-thumb {
          background: rgba(16,64,107,0.12);
          border-radius: 99px;
        }
        .tp-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(16,64,107,0.22);
        }

        /* ── Add button ── */
        .tp-add-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(238,129,61,0.07);
          border: 1px solid rgba(238,129,61,0.2);
          color: #EE813D;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 9px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          transition: background 0.18s, border-color 0.18s;
        }
        .tp-add-btn:hover {
          background: rgba(238,129,61,0.14);
          border-color: rgba(238,129,61,0.35);
        }

        /* ── Skills ── */
        .tp-skill-name { font-size: 14px; font-weight: 600; color: #0D2137; }
        .tp-skill-track {
          height: 6px;
          background: rgba(16,64,107,0.07);
          border-radius: 99px;
          overflow: hidden;
        }
        .tp-skill-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(.22,.68,0,1.2);
        }

        /* ── Experience timeline ── */
        .tp-exp-row { display: flex; gap: 16px; }
        .tp-exp-connector { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .tp-exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 8px; }
        .tp-exp-actions { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
        .tp-exp-date {
          font-size: 11px;
          color: #5A7A96;
          background: rgba(16,64,107,0.05);
          border: 1px solid rgba(16,64,107,0.08);
          padding: 3px 10px;
          border-radius: 8px;
        }
        .tp-icon-btn {
          background: none; border: none; cursor: pointer; padding: 4px;
          opacity: 0.5; transition: opacity 0.15s;
          border-radius: 6px;
        }
        .tp-icon-btn:hover { opacity: 1; background: rgba(16,64,107,0.05); }

        /* ── Formation card ── */
        .tp-form-card {
          background: #F7F8FA;
          border: 1px solid rgba(16,64,107,0.08);
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        /* ── Language card ── */
        .tp-lang-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }
        .tp-lang-card {
          background: #F7F8FA;
          border: 1px solid rgba(16,64,107,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .tp-inner { padding: 16px; height: 460px; }
          .tp-tab-label { display: none; }
          .tp-tab-count { display: none; }
          .tp-tab { padding: 9px 8px; }
          .tp-exp-connector { display: none; }
          .tp-exp-row { gap: 0; }
          .tp-exp-header { flex-direction: column; align-items: flex-start; gap: 6px; }
          .tp-exp-actions { align-self: flex-start; }
          .tp-lang-grid { grid-template-columns: 1fr; }
          .tp-add-label { display: none; }
          .tp-add-btn { padding: 6px 8px; }
        }
        @media (min-width: 481px) and (max-width: 640px) {
          .tp-inner { padding: 20px; }
          .tp-exp-connector { display: none; }
          .tp-exp-row { gap: 0; }
          .tp-exp-header { flex-wrap: wrap; gap: 6px; }
        }
      `}</style>

      <div className="tp-card">
        <div className="tp-topline" />

        <div className="tp-inner">

          {/* ── Tab bar ── */}
          <div className="tp-tabbar">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={`tp-tab${tab === t.key ? " tp-tab-active" : ""}`}
              >
                <t.icon size={13}/>
                <span className="tp-tab-label">{t.label}</span>
                {t.count > 0 && (
                  <span className="tp-tab-count">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Scrollable body ── */}
          <div className="tp-scroll">

            {/* Skills */}
            {tab === "skills" && (
              <div>
                {sectionHeader(copy.skills, addBtn(onAddSkill))}
                {skills.length === 0
                  ? empty(<Star size={32}/>, copy.emptySkills)
                  : skills.map(({ competence, niveau }) => (
                    <div key={competence.id} style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center", gap: 8 }}>
                        <span className="tp-skill-name">{competence.nom}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: skillColor(niveau) }}>
                            {niveau}% · {skillLevelLabel(niveau)}
                          </span>
                          <button className="tp-icon-btn"
                            onClick={async () => {
                              try {
                                await candidatsApi.deleteSkill(competence.id);
                                qc.invalidateQueries({ queryKey: ["profile"] });
                                toast.success(copy.deleteSkillSuccess);
                              } catch { toast.error(copy.deleteError); }
                            }}
                          >
                            <Trash2 size={13} color="#D64045"/>
                          </button>
                        </div>
                      </div>
                      <div className="tp-skill-track">
                        <div className="tp-skill-fill" style={{ width: `${niveau}%`, background: `linear-gradient(90deg, ${skillColor(niveau)}80, ${skillColor(niveau)})` }}/>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Experience */}
            {tab === "experience" && (
              <div>
                {sectionHeader(copy.experience, addBtn(onAddExp))}
                {exps.length === 0
                  ? empty(<Briefcase size={32}/>, copy.emptyExp)
                  : [...exps]
                      .sort((a, b) => {
                        // 1. Current jobs always first
                        if (a.actuel && !b.actuel) return -1;
                        if (!a.actuel && b.actuel) return 1;

                        // 2. Otherwise sort by most recent date (end date preferred, fallback start)
                        const aDate = new Date((a.dateFin || a.dateDebut) + "-01").getTime();
                        const bDate = new Date((b.dateFin || b.dateDebut) + "-01").getTime();

                        return bDate - aDate;
                      })
                      .map((exp, i, arr) => {
                        const color = SKILL_COLORS[i % SKILL_COLORS.length];
                        const fmt = (v?: string) => v ? new Date(v + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" }) : "";
                        return (
                          <div key={exp.id} className="tp-exp-row" style={{ marginBottom: i < arr.length - 1 ? 24 : 0 }}>
                            <div className="tp-exp-connector">
                              <div style={{ width: 11, height: 11, borderRadius: "50%", background: color, marginTop: 4, boxShadow: `0 0 0 3px ${color}30`, flexShrink: 0 }}/>
                              {i < arr.length - 1 && (
                                <div style={{ width: 2, flex: 1, background: "rgba(16,64,107,0.08)", marginTop: 7, borderRadius: 1 }}/>
                              )}
                            </div>
                            <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 8 : 0 }}>
                              <div className="tp-exp-header">
                                <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "#0D2137" }}>{exp.poste}</div>
                                <div className="tp-exp-actions">
                                  <span className="tp-exp-date">{fmt(exp.dateDebut)} – {exp.actuel ? copy.present : fmt(exp.dateFin)}</span>
                                  <button className="tp-icon-btn" onClick={() => onEditExp(exp)}><Edit2 size={12} color="#5A7A96"/></button>
                                  <button className="tp-icon-btn" onClick={async () => { try { await candidatsApi.deleteExperience(exp.id); qc.invalidateQueries({ queryKey: ["profile"] }); toast.success(copy.deleted); } catch { toast.error(copy.error); } }}><Trash2 size={12} color="#D64045"/></button>
                                </div>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 4 }}>{exp.entreprise}</div>
                              {exp.description && <div style={{ fontSize: 13, color: "#5A7A96", lineHeight: 1.65 }}>{exp.description}</div>}
                            </div>
                          </div>
                        );
                      })
                }
              </div>
            )}

            {/* Formation */}
            {tab === "formation" && (
              <div>
                {sectionHeader(copy.formation, addBtn(onAddForm))}
                {forms.length === 0
                  ? empty(<Award size={32}/>, copy.emptyForm)
                  : forms.map((f, i) => {
                    const color = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <div key={f.id} className="tp-form-card" style={{ borderLeft: `3px solid ${color}` }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "#0D2137", marginBottom: 4 }}>{f.diplome}</div>
                          <div style={{ fontSize: 12, color: "#5A7A96" }}>{f.ecole} · {f.annee}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button className="tp-icon-btn" onClick={() => onEditForm(f)}><Edit2 size={12} color="#5A7A96"/></button>
                          <button className="tp-icon-btn" onClick={async () => { try { await candidatsApi.deleteFormation(f.id); qc.invalidateQueries({ queryKey: ["profile"] }); toast.success(copy.deleted); } catch { toast.error(copy.error); } }}><Trash2 size={12} color="#D64045"/></button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* Langues */}
            {tab === "langues" && (
              <div>
                {sectionHeader(copy.langues, addBtn(onAddLang))}
                {langs.length === 0
                  ? empty(<Globe2 size={32}/>, copy.emptyLang)
                  : (
                    <div className="tp-lang-grid">
                      {langs.map(l => {
                        const color = LANGUE_NIVEAU_COLORS[l.niveau] ?? "#5A7A96";
                        return (
                          <div key={l.id} className="tp-lang-card" style={{ borderColor: `${color}25` }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#0D2137", marginBottom: 6 }}>{l.nom}</div>
                              <span style={{ background: `${color}18`, color, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99 }}>{l.niveau}</span>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="tp-icon-btn" onClick={() => onEditLang(l)}><Edit2 size={12} color="#5A7A96"/></button>
                              <button className="tp-icon-btn" onClick={async () => { try { await candidatsApi.deleteLangue(l.id); qc.invalidateQueries({ queryKey: ["profile"] }); toast.success(copy.deleted); } catch { toast.error(copy.error); } }}><Trash2 size={12} color="#D64045"/></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>
            )}

          </div>{/* /tp-scroll */}
        </div>{/* /tp-inner */}
      </div>
    </>
  );
}