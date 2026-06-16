// frontend/src/app/admin/components/CompetenceSelect.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Plus } from "lucide-react";
import { inputStyle } from "./Field";
import { adminApi } from "@/lib/api";

interface Competence {
  id:  number;
  nom: string;
}

interface Props {
  value: string[];                    // array of nom strings
  onChange: (value: string[]) => void;
}

export function CompetenceSelect({ value, onChange }: Props) {
  const [options, setOptions]   = useState<Competence[]>([]);
  const [query, setQuery]       = useState("");
  const [open, setOpen]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const ref                     = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // Fetch all competences on mount
  useEffect(() => {
    adminApi.getAllCompetences()
      .then(({ data }) => setOptions(data))
      .catch(console.error);
  }, []);

  // Close dropdown on outside click
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
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = query.trim()
    ? options.filter(o =>
        o.nom.toLowerCase().includes(query.toLowerCase()) &&
        !value.includes(o.nom)
      )
    : options.filter(o => !value.includes(o.nom));

  const queryIsNew = query.trim() &&
    !options.some(o => o.nom.toLowerCase() === query.trim().toLowerCase());

  const select = (nom: string) => {
    if (!value.includes(nom)) onChange([...value, nom]);
    setQuery("");
    inputRef.current?.focus();
  };

  const remove = (nom: string) => onChange(value.filter(v => v !== nom));

  const createAndSelect = async () => {
    const trimmed = query.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const { data } = await adminApi.upsertCompetence(trimmed);
      // Add to local list if truly new
      if (!options.find(o => o.id === data.id)) {
        setOptions(prev => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
      }
      select(data.nom);
    } catch (err) {
      console.error("Failed to save competence:", err);
    } finally {
      setSaving(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (queryIsNew) createAndSelect();
      else if (filtered.length > 0) select(filtered[0].nom);
    }
    if (e.key === "Backspace" && !query && value.length > 0) {
      remove(value[value.length - 1]);
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Input box with tags */}
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        style={{
          ...inputStyle,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          minHeight: 42,
          height: "auto",
          cursor: "text",
          padding: "6px 10px",
        }}
      >
        {/* Selected tags */}
        {value.map(nom => (
          <span
            key={nom}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "rgba(34,132,192,0.1)", color: "#2284C0",
              fontSize: 12, fontWeight: 600,
              padding: "3px 8px 3px 10px", borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            {nom}
            <span
              onMouseDown={e => { e.stopPropagation(); remove(nom); }}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", opacity: 0.7 }}
            >
              <X size={11} />
            </span>
          </span>
        ))}

        {/* Search input */}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? "React, TypeScript, Node.js…" : ""}
          style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif",
            flex: 1, minWidth: 120, padding: 0,
          }}
        />

        <ChevronDown
          size={14} color="#9BAFC0"
          style={{ marginLeft: "auto", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 9999, background: "white",
          border: "1.5px solid rgba(16,64,107,0.12)", borderRadius: 10,
          boxShadow: "0 8px 30px rgba(16,64,107,0.12)", overflow: "hidden",
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: "4px 0", maxHeight: 220, overflowY: "auto" }}>

            {/* "Create new" option */}
            {queryIsNew && (
              <li
                onMouseDown={createAndSelect}
                style={{
                  padding: "9px 14px", fontSize: 13, color: "#2284C0",
                  cursor: saving ? "wait" : "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                  borderBottom: "1px solid rgba(16,64,107,0.06)",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,132,192,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Plus size={13} />
                {saving ? "Enregistrement…" : `Créer "${query.trim()}"`}
              </li>
            )}

            {filtered.length === 0 && !queryIsNew && (
              <li style={{ padding: "9px 14px", fontSize: 13, color: "#9BAFC0", fontFamily: "'DM Sans',sans-serif" }}>
                {query ? "Aucun résultat" : "Toutes les compétences sont sélectionnées"}
              </li>
            )}

            {filtered.map(o => (
              <li
                key={o.id}
                onMouseDown={() => select(o.nom)}
                style={{
                  padding: "9px 14px", fontSize: 13, fontWeight: 500,
                  color: "#0D2137", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,64,107,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {o.nom}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}