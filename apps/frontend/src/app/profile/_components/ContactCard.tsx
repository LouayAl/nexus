// frontend/src/app/profile/_components/ContactCard.tsx
"use client";

import { Mail, Phone, MapPin, Lock } from "lucide-react";
import type { CandidatProfile } from "@/lib/api";
import type { AppLanguage } from "@/hooks/useAppLanguage";

const COPY = {
  fr: {
    title:    "Contact",
    edit:     "Modifier",
    phone:    "Non renseigné",
    location: "Non renseigné",
    changePw: "Changer le mot de passe",
  },
  en: {
    title:    "Contact",
    edit:     "Edit",
    phone:    "Not provided",
    location: "Not provided",
    changePw: "Change password",
  },
} as const;

interface Props {
  profile:    CandidatProfile;
  email:      string;
  onEdit:     () => void;
  onChangePw: () => void;
  language:   AppLanguage;
}

export function ContactCard({ profile, email, onEdit, onChangePw, language }: Props) {
  const copy = COPY[language];

  const rows = [
    { Icon: Mail,   val: email },
    { Icon: Phone,  val: profile.telephone   ?? copy.phone    },
    { Icon: MapPin, val: profile.localisation ?? copy.location },
  ];

  return (
    <>
      <style>{`
        .cc-card {
          position: relative;
          border-radius: 20px;
          background: linear-gradient(175deg, #237bb1 0%, #237bb1 35%, #216f9f 60%, #216f9f 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.06) inset,
            0 24px 48px -12px rgba(8,20,32,0.55),
            0  4px 16px -4px rgba(8,20,32,0.35);
          overflow: hidden;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .cc-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.06) inset,
            0 32px 56px -12px rgba(8,20,32,0.6),
            0  6px 20px -4px rgba(8,20,32,0.4);
        }
        .cc-topline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #c5a46d 30%, #dfc08a 55%, #c5a46d 75%, transparent 100%);
        }

        /* Header */
        .cc-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(255,255,255,0.35);
        }
        .cc-btn-edit {
          background: none;
          border: none;
          cursor: pointer;
          color: rgb(237,130,59);
          font-size: 11px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
          letter-spacing: 0.02em;
          transition: color 0.18s;
        }
        .cc-btn-edit:hover { color: #dfc08a; }

        /* Row icon badge */
        .cc-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.09);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Change password button */
        .cc-btn-pw {
          width: 100%;
          padding: 10px;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          letter-spacing: 0.01em;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .cc-btn-pw:hover {
          background: #ed823b;
          border-color: rgba(255,255,255,0.17);
          color: rgba(255,255,255,0.85);
        }

        .cc-rule {
          height: 1px;
          background: rgba(255,255,255,0.07);
          border: none;
          margin: 0 0 14px 0;
        }
      `}</style>

      <div className="cc-card">
        <div className="cc-topline" />
        <div style={{ padding: 20 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span className="cc-label">{copy.title}</span>
            <button className="cc-btn-edit" onClick={onEdit}>{copy.edit}</button>
          </div>

          <hr className="cc-rule" />

          {/* Contact rows */}
          {rows.map(({ Icon, val }, idx) => (
            <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: idx < rows.length - 1 ? 12 : 16 }}>
              <div className="cc-icon-badge">
                <Icon size={13} color="rgba(255,255,255,0.55)" />
              </div>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.4 }}>{val}</span>
            </div>
          ))}

          {/* Change password */}
          <button className="cc-btn-pw" onClick={onChangePw}>
            <Lock size={13} />
            {copy.changePw}
          </button>

        </div>
      </div>
    </>
  );
}