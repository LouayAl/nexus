"use client";

import { AlertTriangle, Lock } from "lucide-react";
import type { AppLanguage } from "@/hooks/useAppLanguage";

const COPY = {
  fr: {
    badge:   "Obligatoire",
    title:   "Rémunération à renseigner",
    body:    "Ces informations sont indispensables au traitement de votre candidature. Sans rémunération renseignée, votre candidature sera refusée par le recruteur ou l'équipe Hirin.",
    privacy: "Vos données de rémunération sont confidentielles : elles ne sont visibles que par les recruteurs et l'équipe Hirin, et ne sont jamais partagées avec des tiers.",
  },
  en: {
    badge:   "Required",
    title:   "Salary details required",
    body:    "This information is essential to process your application. If your salary details are missing, your application will be declined by the recruiter or the Hirin team.",
    privacy: "Your salary data is confidential: it is only visible to recruiters and the Hirin team, and is never shared with third parties.",
  },
} as const;

export function SalaryNotice({ language, compact = false  }: { language: AppLanguage; compact?: boolean }) {
  const copy = COPY[language];

  return (
    <div
      role="alert"
      style={{
        position: "relative",
        flexShrink: 0,
        display: "flex",
        gap: 14,
        padding: "16px 18px 16px 22px",
        marginBottom: compact ? 0 : 16, 
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(214,64,69,0.10) 0%, rgba(214,64,69,0.04) 100%)",
        border: "1.5px solid rgba(214,64,69,0.35)",
        boxShadow: "0 6px 20px -8px rgba(214,64,69,0.35)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "#D64045" }} />

      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: "#D64045", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(214,64,69,0.35)",
      }}>
        <AlertTriangle size={19} color="white" />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#B02A2F", letterSpacing: "-0.01em" }}>
            {copy.title}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "2px 8px", borderRadius: 99, background: "#D64045", color: "white",
          }}>
            {copy.badge}
          </span>
        </div>

        <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.55, color: "#7A2428" }}>
          {copy.body}
        </p>

        <div style={{
          display: "flex", alignItems: "flex-start", gap: 7,
          paddingTop: 10, borderTop: "1px dashed rgba(214,64,69,0.30)",
          fontSize: 11.5, lineHeight: 1.5, fontWeight: 600, color: "#8E3A3E",
        }}>
          <Lock size={12} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{copy.privacy}</span>
        </div>
      </div>
    </div>
  );
}