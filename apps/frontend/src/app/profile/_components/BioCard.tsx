// frontend/src/app/profile/_components/BioCard.tsx
"use client";

import type { AppLanguage } from "@/hooks/useAppLanguage";

const COPY = {
  fr: { title: "À propos" },
  en: { title: "About"    },
} as const;

interface Props {
  bio:      string;
  language: AppLanguage;
}

export function BioCard({ bio, language }: Props) {
  const copy = COPY[language];

  return (
    <>
      <style>{`
        .bc-card {
          position: relative;
          border-radius: 20px;
          background: linear-gradient(175deg, #216f9f 0%, #216f9f 35%, #237bb1 68%, #237bb1 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.06) inset,
            0 24px 48px -12px rgba(8,20,32,0.55),
            0  4px 16px -4px rgba(8,20,32,0.35);
          overflow: hidden;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .bc-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.06) inset,
            0 32px 56px -12px rgba(8,20,32,0.6),
            0  6px 20px -4px rgba(8,20,32,0.4);
        }
        .bc-topline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #c5a46d 30%, #dfc08a 55%, #c5a46d 75%, transparent 100%);
        }
        .bc-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 10px;
        }
        .bc-text {
          font-size: 13px;
          color: rgba(255,255,255,0.68);
          line-height: 1.75;
          margin: 0;
        }
      `}</style>

      <div className="bc-card">
        <div className="bc-topline" />
        <div style={{ padding: 20 }}>
          <div className="bc-label">{copy.title}</div>
          <p className="bc-text">{bio}</p>
        </div>
      </div>
    </>
  );
}