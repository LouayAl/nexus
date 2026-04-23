// frontend/src/app/profile/_components/IdentityCard.tsx
"use client";

import { Download, Edit2, Loader2, MapPin, Upload } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";
import type { AppLanguage } from "@/hooks/useAppLanguage";
import { type CandidatProfile } from "@/lib/api";
import { completionPct, initials } from "./types";

const COPY = {
  fr: {
    edit:        "Éditer",
    editProfile: "Éditer le profil",
    completed:   "Profil complété",
    experiences: "Expériences",
    skills:      "Compétences",
    languages:   "Langues",
    cv:          "Mon CV",
    upload:      "Importer mon CV",
    uploading:   "Importation...",
  },
  en: {
    edit:        "Edit",
    editProfile: "Edit profile",
    completed:   "Profile completion",
    experiences: "Experiences",
    skills:      "Skills",
    languages:   "Languages",
    cv:          "My resume",
    upload:      "Upload my resume",
    uploading:   "Uploading...",
  },
} as const;

interface Props {
  profile:       CandidatProfile;
  uploadPending: boolean;
  isMobile:      boolean;
  onEdit:        () => void;
  onUploadCv:    () => void;
  language:      AppLanguage;
}

export function IdentityCard({ profile, uploadPending, isMobile, onEdit, onUploadCv, language }: Props) {
  const copy   = COPY[language];
  const pct    = completionPct(profile);
  const exps   = profile.experiences ?? [];
  const skills = profile.competences ?? [];
  const langs  = profile.langues     ?? [];
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "";
  const cvUrl  = profile.cvUrl ? `${API_BASE}${profile.cvUrl}` : null;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Card ── */
        .ic-card {
          position: relative;
          border-radius: 20px;
          background: linear-gradient(175deg, #10406b 0%, #10426c 35%, #165183 68%, #216f9f 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.06) inset,
            0 24px 48px -12px rgba(8,20,32,0.55),
            0  4px 16px -4px rgba(8,20,32,0.35);
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          overflow: hidden;
        }
        .ic-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.06) inset,
            0 32px 56px -12px rgba(8,20,32,0.6),
            0  6px 20px -4px rgba(8,20,32,0.4);
        }

        /* Gold top accent — the single luxe detail */
        .ic-topline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #c5a46d 30%, #dfc08a 55%, #c5a46d 75%, transparent 100%);
        }

        /* ── Text ── */
        .ic-name  { color: #ffffff; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
        .ic-title { color: rgba(255,255,255,0.50); font-weight: 400; letter-spacing: 0.01em; }
        .ic-loc   { color: rgba(255,255,255,0.32); }

        /* ── Divider ── */
        .ic-rule { height: 1px; background: rgba(255,255,255,0.07); border: none; margin: 0; }

        /* ── Edit button ── */
        .ic-btn-edit {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 9px;
          padding: 6px 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: rgba(255,255,255,0.72);
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
          white-space: nowrap;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .ic-btn-edit:hover {
          background: #ed823b;
          border-color: rgba(255,255,255,0.2);
          color: #fff;
        }

        /* ── Progress ── */
        .ic-prog-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .ic-prog-pct {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .ic-prog-track {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 99px;
          overflow: hidden;
        }
        .ic-prog-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #ed823b, #f29d65);
          transition: width 0.7s cubic-bezier(.22,.68,0,1.2);
        }

        /* ── Stats ── */
        .ic-stat-val {
          font-weight: 800;
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .ic-stat-lbl {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.33);
          margin-top: 3px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .ic-stat-rule {
          width: 1px;
          background: rgba(255,255,255,0.07);
          align-self: stretch;
          flex-shrink: 0;
        }

        /* ── Ghost buttons (CV download / replace) ── */
        .ic-btn-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 11px;
          color: rgba(255,255,255,0.75);
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          letter-spacing: 0.01em;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          text-decoration: none;
        }
        .ic-btn-ghost:hover {
          background: #ed823b;
          border-color: rgba(255,255,255,0.17);
          color: #fff;
        }

        /* ── Gold CTA ── */
        .ic-btn-upload {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #c5a46d 0%, #dfc08a 100%);
          border: none;
          border-radius: 12px;
          color: #0f1f2d;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 18px rgba(197,164,109,0.25);
          transition: filter 0.18s, box-shadow 0.18s, transform 0.15s, opacity 0.18s;
        }
        .ic-btn-upload:hover:not(:disabled) {
          filter: brightness(1.06);
          box-shadow: 0 6px 24px rgba(197,164,109,0.35);
          transform: translateY(-1px);
        }
        .ic-btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="ic-card">
        <div className="ic-topline" />

        <div style={{ padding: isMobile ? 20 : 28 }}>

          {/* ── Header ── */}
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
              <AvatarUpload initials={initials(profile)} avatarUrl={profile.avatarUrl} size={64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                  <div className="ic-name" style={{ fontSize: 17 }}>
                    {profile.prenom} {profile.nom}
                  </div>
                  <button className="ic-btn-edit" onClick={onEdit}>
                    <Edit2 size={11} />{copy.edit}
                  </button>
                </div>
                {profile.titre && <div className="ic-title" style={{ fontSize: 13, marginBottom: 4 }}>{profile.titre}</div>}
                {profile.localisation && (
                  <div className="ic-loc" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} />{profile.localisation}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <AvatarUpload initials={initials(profile)} avatarUrl={profile.avatarUrl} size={84} />
              </div>
              <div className="ic-name" style={{ fontSize: 21, marginBottom: 5 }}>
                {profile.prenom} {profile.nom}
              </div>
              {profile.titre && (
                <div className="ic-title" style={{ fontSize: 13, marginBottom: 6 }}>{profile.titre}</div>
              )}
              {profile.localisation && (
                <div className="ic-loc" style={{ fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 14 }}>
                  <MapPin size={11} />{profile.localisation}
                </div>
              )}
              <button className="ic-btn-edit" onClick={onEdit}>
                <Edit2 size={11} />{copy.editProfile}
              </button>
            </div>
          )}

          {/* ── Progress ── */}
          <hr className="ic-rule" style={{ marginBottom: 16 }} />
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="ic-prog-label">{copy.completed}</span>
              <span className="ic-prog-pct" style={{ color: pct >= 80 ? "#ed823b" : "#dfc08a" }}>{pct}%</span>
            </div>
            <div className="ic-prog-track">
              <div className="ic-prog-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <hr className="ic-rule" style={{ marginBottom: 20 }} />

          {/* ── Stats ── */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            {[
              [String(exps.length),   copy.experiences],
              [String(skills.length), copy.skills],
              [String(langs.length),  copy.languages],
            ].map(([value, label], i, arr) => (
              < >
                <div key={label} style={{ flex: 1, textAlign: "center", padding: "0 6px" }}>
                  <div className="ic-stat-val" style={{ fontSize: isMobile ? 18 : 20 }}>{value}</div>
                  <div className="ic-stat-lbl">{label}</div>
                </div>
                {i < arr.length - 1 && <div className="ic-stat-rule" key={`d${i}`} />}
              </>
            ))}
          </div>

          {/* ── CV ── */}
          {cvUrl ? (
            <div style={{ display: "flex", gap: 8 }}>
              <a href={cvUrl} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex" }}>
                <button className="ic-btn-ghost" style={{ flex: 1, padding: "10px 12px" }}>
                  <Download size={13} />{copy.cv}
                </button>
              </a>
              <button className="ic-btn-ghost" style={{ padding: "10px 13px" }} onClick={onUploadCv}>
                <Upload size={14} />
              </button>
            </div>
          ) : (
            <button className="ic-btn-upload" onClick={onUploadCv} disabled={uploadPending}>
              {uploadPending
                ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />{copy.uploading}</>
                : <><Upload size={14} />{copy.upload}</>
              }
            </button>
          )}

        </div>
      </div>
    </>
  );
}