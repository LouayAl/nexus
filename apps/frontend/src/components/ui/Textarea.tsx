// components/ui/Textarea.tsx
"use client";

import { type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: React.ElementType;
}

export function Textarea({ label, icon: Icon, className, style, ...props }: TextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ color: theme.textSub, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {Icon && <Icon size={15} color={theme.textSub} />}
        <textarea
          {...props}
          className={cn("bg-transparent border-none outline-none flex-1 py-[11px] text-[13px]", className)}
          style={{ color: theme.text, fontFamily: "'Outfit', sans-serif", ...style }}
        />
      </div>
    </div>
  );
}