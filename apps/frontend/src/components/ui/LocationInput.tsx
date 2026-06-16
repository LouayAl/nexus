// frontend/src/components/ui/LocationInput.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, Loader2 } from "lucide-react";

interface Suggestion { short: string; }

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function LocationInput({ value, onChange, style, placeholder = "Tanger, Maroc" }: LocationInputProps) {
  const [query, setQuery]             = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const debounceRef                   = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const abortRef                      = useRef<AbortController | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const res = await fetch(
        `/api/geocoding/autocomplete?q=${encodeURIComponent(q)}`,
        { signal: abortRef.current.signal }
      );
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch (e: any) {
      if (e.name !== "AbortError") setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 350);
  }

  function handleFocus() {
    if (query.length === 0) search("Maroc");
    else if (suggestions.length > 0) setOpen(true);
  }

  function handleSelect(s: Suggestion) {
    setQuery(s.short);
    onChange(s.short);
    setSuggestions([]);
    setOpen(false);
  }

  const dropdown = open && suggestions.length > 0 ? createPortal(
    <ul style={{
      position: "absolute",
      top: dropdownPos.top,
      left: dropdownPos.left,
      width: dropdownPos.width,
      zIndex: 9999,
      background: "white",
      border: "1.5px solid rgba(16,64,107,0.12)",
      borderRadius: 10,
      boxShadow: "0 8px 30px rgba(16,64,107,0.12)",
      listStyle: "none",
      margin: 0,
      padding: "4px 0",
      maxHeight: 220,
      overflowY: "auto",
    }}>
      {suggestions.map((s, i) => (
        <li
          key={i}
          onMouseDown={() => handleSelect(s)}
          style={{
            padding: "9px 14px",
            fontSize: 13,
            color: "#0D2137",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,132,192,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <MapPin size={12} color="#2284C0" style={{ flexShrink: 0 }} />
          {s.short}
        </li>
      ))}
    </ul>,
    document.body,
  ) : null;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <MapPin size={14} color="#5A7A96" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}/>
        <input
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={{ ...style, paddingLeft: 32, paddingRight: loading ? 32 : undefined }}
        />
        {loading && (
          <Loader2 size={14} color="#5A7A96" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", animation: "spin 0.8s linear infinite", pointerEvents: "none" }}/>
        )}
      </div>
      {dropdown}
    </div>
  );
}