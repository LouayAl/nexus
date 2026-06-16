// frontend/src/components/common/LanguageToggle.tsx
"use client";

import type { AppLanguage } from "@/hooks/useAppLanguage";

export function LanguageToggle({
  language,
  onChange,
}: {
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "rgb(240,245,250)",
        border: "1px solid rgb(240,245,250)",
      }}
    >
      {(["fr", "en"] as const).map((value) => {
        const active = language === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            style={{
              border: "none",
              cursor: "pointer",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: "'DM Sans', sans-serif",
              color: active ? "white" : "#B0A090",
              background: active
                ? "linear-gradient(135deg, #EE813D, #d4691f)"
                : "transparent",
              boxShadow: active ? "0 2px 8px rgba(238,129,61,0.35)" : "none",
              transition: "all 0.18s",
            }}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}