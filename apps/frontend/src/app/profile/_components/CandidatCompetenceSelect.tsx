// frontend/src/app/profile/_components/CandidatCompetenceSelect.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { candidatsApi } from "@/lib/api";
import { ChevronDown, Plus } from "lucide-react";

interface Competence {
  id:  number;
  nom: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CandidatCompetenceSelect({ value, onChange }: Props) {
    const [options, setOptions] = useState<Competence[]>([]);
    const [query, setQuery]     = useState("");
    const [open, setOpen]       = useState(false);
    const ref                   = useRef<HTMLDivElement>(null);
    const inputRef              = useRef<HTMLInputElement>(null);

        useEffect(() => {
            candidatsApi.getAllCompetences()
            .then(({ data }) => setOptions(data))
            .catch(console.error);
        }, []);

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
        ? options.filter(o => o.nom.toLowerCase().includes(query.toLowerCase()))
        : options;

    const select = (nom: string) => {
        onChange(nom);
        setQuery("");
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        // If query matches nothing, use it as-is
        const exactMatch = options.find(o => o.nom.toLowerCase() === trimmed.toLowerCase());
        select(exactMatch ? exactMatch.nom : trimmed);
    }
    if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
    }
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
        {/* Trigger */}
        <div
            onClick={() => { setOpen(o => !o); setQuery(""); }}
            style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 11,
            border: `1.5px solid ${open ? "#2284C0" : "rgba(16,64,107,0.12)"}`,
            background: open ? "white" : "#FAFAF8",
            boxShadow: open ? "0 0 0 3px rgba(34,132,192,0.08)" : "none",
            outline: "none",
            fontSize: 13,
            color: value ? "#0D2137" : "#9BAFC0",
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: value ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            transition: "all 0.18s",
            boxSizing: "border-box",
            }}
        >
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value || "React, Python, Figma…"}
            </span>
            <ChevronDown
            size={14} color="#9BAFC0"
            style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
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
            {/* Search */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(16,64,107,0.07)" }}>
                <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher…"
                style={{
                    width: "100%", padding: "7px 10px", fontSize: 12,
                    borderRadius: 8, border: "1px solid rgba(16,64,107,0.1)",
                    background: "#F7F8FA", outline: "none",
                    fontFamily: "'DM Sans',sans-serif", color: "#0D2137",
                    boxSizing: "border-box",
                }}
                />
            </div>

            <ul style={{ listStyle: "none", margin: 0, padding: "4px 0", maxHeight: 200, overflowY: "auto" }}>
                {filtered.length === 0 && (
                <li style={{ padding: "9px 14px", fontSize: 13, color: "#9BAFC0", fontFamily: "'DM Sans',sans-serif" }}>
                    Aucun résultat
                </li>
                )}
                {/* Free-text create option */}
                {query.trim() && !options.some(o => o.nom.toLowerCase() === query.trim().toLowerCase()) && (
                <li
                    onMouseDown={() => select(query.trim())}
                    style={{
                    padding: "9px 14px", fontSize: 13, color: "#2284C0",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(16,64,107,0.06)",
                    display: "flex", alignItems: "center", gap: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,132,192,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                    <Plus size={13} />
                    Utiliser "{query.trim()}"
                </li>
                )}
                {filtered.map(o => (
                <li
                    key={o.id}
                    onMouseDown={() => select(o.nom)}
                    style={{
                    padding: "9px 14px", fontSize: 13, fontWeight: value === o.nom ? 700 : 500,
                    color: value === o.nom ? "#2284C0" : "#0D2137",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    background: value === o.nom ? "rgba(34,132,192,0.06)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,64,107,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = value === o.nom ? "rgba(34,132,192,0.06)" : "transparent")}
                >
                    {o.nom}
                    {value === o.nom && (
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2284C0", flexShrink: 0 }} />
                    )}
                </li>
                ))}
            </ul>
            </div>
        )}
        </div>
    );
}