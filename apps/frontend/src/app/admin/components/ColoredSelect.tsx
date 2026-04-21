// frontend/src/app/admin/components/ColoredSelect.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { inputStyle } from "./Field";

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface ColoredSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
}

export function ColoredSelect({
  value, onChange, options, placeholder = "— Sélectionner —", searchable = false,
}: ColoredSelectProps) {
  const [open, setOpen]             = useState(false);
  const [query, setQuery]           = useState("");
  const [customOptions, setCustomOptions] = useState<Option[]>([]);
  const ref                         = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  // Merge built-in + custom options
  const allOptions = [...options, ...customOptions];
  const selected   = allOptions.find(o => o.value === value);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  const filtered = query.trim()
    ? allOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : allOptions;

  const handleCustomSelect = (customValue: string) => {
    const trimmed = customValue.trim();
    // Add to local custom options if not already there
    if (!allOptions.find(o => o.value === trimmed)) {
      setCustomOptions(prev => [...prev, { value: trimmed, label: trimmed }]);
    }
    onChange(trimmed);
    setOpen(false);
    setQuery("");
  };

  const color = selected?.color;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => { setOpen(o => !o); setQuery(""); }}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          color: color ?? (selected ? "#0D2137" : "#9BAFC0"),
          fontWeight: selected ? 700 : 400,
          borderColor: color ? `${color}50` : "rgba(16,64,107,0.12)",
          background: color ? `${color}08` : "#FAFAF8",
          transition: "all 0.15s",
          gap: 8,
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {value && (
            <div
              onMouseDown={e => { e.stopPropagation(); onChange(""); }}
              style={{ display: "flex", alignItems: "center", padding: 2, borderRadius: 4, cursor: "pointer" }}
            >
              <X size={11} color="#9BAFC0"/>
            </div>
          )}
          <ChevronDown
            size={14}
            color={color ?? "#9BAFC0"}
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0, right: 0,
          zIndex: 9999,
          background: "white",
          border: "1.5px solid rgba(16,64,107,0.12)",
          borderRadius: 10,
          boxShadow: "0 8px 30px rgba(16,64,107,0.12)",
          overflow: "hidden",
        }}>
          {searchable && (
            <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(16,64,107,0.07)" }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher ou saisir…"
                style={{
                  ...inputStyle,
                  padding: "7px 10px",
                  fontSize: 12,
                  background: "#F7F8FA",
                  border: "1px solid rgba(16,64,107,0.1)",
                }}
              />
            </div>
          )}

          <ul style={{ listStyle: "none", margin: 0, padding: "4px 0", maxHeight: 220, overflowY: "auto" }}>
            {/* Custom value option */}
            {searchable && query.trim() && !allOptions.find(o => o.label.toLowerCase() === query.toLowerCase()) && (
              <li
                onMouseDown={() => handleCustomSelect(query)}
                style={{
                  padding: "9px 14px", fontSize: 13, color: "#2284C0",
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 600, fontStyle: "italic",
                  borderBottom: "1px solid rgba(16,64,107,0.06)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,132,192,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Utiliser "{query.trim()}"
              </li>
            )}

            {filtered.length === 0 && (
              <li style={{ padding: "9px 14px", fontSize: 13, color: "#9BAFC0", fontFamily: "'DM Sans',sans-serif" }}>
                Aucun résultat
              </li>
            )}

            {filtered.map(o => (
              <li
                key={o.value}
                onMouseDown={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                style={{
                  padding: "9px 14px", fontSize: 13,
                  fontWeight: o.color ? 700 : 500,
                  color: o.color ?? "#0D2137",
                  cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  background: value === o.value ? (o.color ? `${o.color}10` : "rgba(16,64,107,0.05)") : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = o.color ? `${o.color}10` : "rgba(16,64,107,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = value === o.value ? (o.color ? `${o.color}10` : "rgba(16,64,107,0.05)") : "transparent")}
              >
                {o.label}
                {value === o.value && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: o.color ?? "#10406B", flexShrink: 0 }}/>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}