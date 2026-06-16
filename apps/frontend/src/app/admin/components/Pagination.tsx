"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page:       number;
  totalPages: number;
  total:      number;
  limit:      number;
  onChange:   (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  // Build page number array with ellipsis
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)            pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btn = (
    label: React.ReactNode,
    onClick: () => void,
    disabled: boolean,
    active = false,
  ) => (
    <button
      key={String(label)}
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 36, height: 36, borderRadius: 9,
        border: active
          ? "none"
          : "1px solid rgba(16,64,107,0.12)",
        background: active
          ? "linear-gradient(135deg,#10406B,#2284C0)"
          : disabled ? "#F7F8FA" : "white",
        color: active ? "white" : disabled ? "#B0C4D4" : "#0D2137",
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans',sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
        padding: "0 10px",
      }}
      onMouseEnter={e => {
        if (!disabled && !active)
          (e.currentTarget as HTMLElement).style.borderColor = "#2284C0";
      }}
      onMouseLeave={e => {
        if (!disabled && !active)
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,64,107,0.12)";
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 24 }}>
      <div style={{ fontSize: 12, color: "#5A7A96" }}>
        <span style={{ fontWeight: 700, color: "#10406B" }}>{from}–{to}</span> sur{" "}
        <span style={{ fontWeight: 700, color: "#10406B" }}>{total}</span> candidats
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {btn(<ChevronLeft size={15}/>, () => onChange(page - 1), page === 1)}
        {pages.map((p, i) =>
          p === "..."
            ? <span key={`ellipsis-${i}`} style={{ display: "flex", alignItems: "center", padding: "0 4px", color: "#B0C4D4", fontSize: 13 }}>…</span>
            : btn(p, () => onChange(p as number), false, p === page)
        )}
        {btn(<ChevronRight size={15}/>, () => onChange(page + 1), page === totalPages)}
      </div>
    </div>
  );
}