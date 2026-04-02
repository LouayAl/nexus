// apps/frontend/src/components/ui/index.tsx
"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, style, onClick }: {
  children:   ReactNode;
  className?: string;
  style?:     React.CSSProperties;
  onClick?:   () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("glass-card", className)}
      style={{ cursor: onClick ? "pointer" : undefined, ...style }}
    >
      {children}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "accent" | "neutral";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  primary:   { bg: theme.primaryDim,   text: theme.primary   },
  secondary: { bg: theme.secondaryDim, text: theme.secondary },
  success:   { bg: theme.successDim,   text: theme.success   },
  warning:   { bg: theme.warningDim,   text: theme.warning   },
  danger:    { bg: theme.dangerDim,    text: theme.danger    },
  accent:    { bg: theme.accentDim,    text: theme.accent    },
  neutral:   { bg: "rgba(106,120,152,0.1)", text: theme.textSub },
};

export function Badge({ children, variant = "primary", className }: {
  children:  ReactNode;
  variant?:  BadgeVariant;
  className?: string;
}) {
  const s = BADGE_STYLES[variant];
  return (
    <span
      className={cn("inline-block rounded-full text-[11px] font-bold uppercase tracking-[0.05em]", className)}
      style={{ background: s.bg, color: s.text, padding: "3px 10px" }}
    >
      {children}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
  icon?:    ReactNode;
}

export function Button({
  children, variant = "primary", size = "md",
  loading, icon, className, ...props
}: ButtonProps) {
  const sizeClass =
    size === "sm" ? "text-[12px] px-3 py-[6px]" :
    size === "lg" ? "text-[14px] px-6 py-[11px]" :
                   "text-[13px] px-4 py-[9px]";

  const styles: React.CSSProperties =
    variant === "primary"   ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, color: "white", border: "none" } :
    variant === "secondary" ? { background: theme.primaryDim,  color: theme.primary, border: `1px solid ${theme.primary}40` } :
    variant === "danger"    ? { background: theme.dangerDim,   color: theme.danger,  border: `1px solid ${theme.danger}30`  } :
    variant === "success"   ? { background: theme.successDim,  color: theme.success, border: `1px solid ${theme.success}30` } :
                              { background: "rgba(255,255,255,0.04)", color: theme.textSub, border: "1px solid rgba(255,255,255,0.07)" };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold font-outfit transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClass, className
      )}
      style={{ fontFamily: "'Outfit', sans-serif", ...styles }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span>⏳</span> : icon}
      {children}
    </button>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color, trend }: {
  label:  string;
  value:  string | number;
  icon:   React.ElementType;
  color:  string;
  trend?: string;
}) {
  return (
    <Card className="flex-1 min-w-[140px]" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: theme.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
            {label}
          </div>
          <div className="font-syne" style={{ fontSize: 30, fontWeight: 800, color: theme.text, lineHeight: 1 }}>
            {value}
          </div>
          {trend && (
            <div style={{ fontSize: 11, color: theme.success, marginTop: 5, fontWeight: 600 }}>
              ↑ {trend}
            </div>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
    </Card>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
export function Input({ label, icon: Icon, className, style, ...props }:
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    icon?:  React.ElementType;
  }
) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ color: theme.textSub, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </label>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {Icon && <Icon size={15} color={theme.textSub} />}
        <input
          className={cn("bg-transparent border-none outline-none flex-1 py-[11px] text-[13px]", className)}
          style={{ color: theme.text, fontFamily: "'Outfit', sans-serif", ...style }}
          {...props}
        />
      </div>
    </div>
  );
}
export { Textarea } from "./Textarea";
export { Select } from "./Select";