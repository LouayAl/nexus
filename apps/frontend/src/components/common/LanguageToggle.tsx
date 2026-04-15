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
        background: "rgba(16,64,107,0.06)",
        border: "1px solid rgba(16,64,107,0.08)",
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
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: "'DM Sans', sans-serif",
              color: active ? "#10406B" : "#5A7A96",
              background: active ? "white" : "transparent",
              boxShadow: active ? "0 1px 6px rgba(16,64,107,0.08)" : "none",
            }}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
