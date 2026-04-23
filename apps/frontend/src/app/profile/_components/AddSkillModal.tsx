"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { candidatsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { Plus, X, CheckCircle, Loader2 } from "lucide-react";
import { skillColor } from "./types";
import { PROFILE_COPY } from "./copy";
import type { AppLanguage } from "@/hooks/useAppLanguage";

interface Competence {
  id: number;
  nom: string;
}

interface Staged {
  nom: string;
  niveau: number;
}

export function AddSkillModal({
  onClose,
  language,
}: {
  onClose: () => void;
  language: AppLanguage;
}) {
  const qc = useQueryClient();
  const copy = PROFILE_COPY[language].skillModal;

  const levelLabel = (niveau: number) => {
    if (niveau <= 40) return copy.beginner;
    if (niveau <= 70) return copy.intermediate;
    return copy.expert;
  };

  const [options, setOptions] = useState<Competence[]>([]);
  const [query, setQuery] = useState("");
  const [niveau, setNiveau] = useState(70);
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [saving, setSaving] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    candidatsApi
      .getAllCompetences()
      .then(({ data }) => setOptions(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const stagedNames = staged.map((s) => s.nom.toLowerCase());
  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.nom.toLowerCase().includes(query.toLowerCase()) &&
          !stagedNames.includes(o.nom.toLowerCase()),
      )
    : options.filter((o) => !stagedNames.includes(o.nom.toLowerCase()));

  const queryIsNew =
    query.trim() &&
    !options.some((o) => o.nom.toLowerCase() === query.trim().toLowerCase());

  const queryAlreadyStaged = staged.some(
    (s) => s.nom.toLowerCase() === query.trim().toLowerCase(),
  );

  const stage = (nom: string) => {
    if (staged.some((s) => s.nom.toLowerCase() === nom.toLowerCase())) return;
    setStaged((prev) => [...prev, { nom, niveau }]);
    setQuery("");
    setNiveau(70);
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeStaged = (nom: string) =>
    setStaged((prev) => prev.filter((s) => s.nom !== nom));

  const updateStagedNiveau = (nom: string, n: number) =>
    setStaged((prev) =>
      prev.map((s) => (s.nom === nom ? { ...s, niveau: n } : s)),
    );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed || queryAlreadyStaged) return;
      const exact = options.find(
        (o) => o.nom.toLowerCase() === trimmed.toLowerCase(),
      );
      stage(exact ? exact.nom : trimmed);
    }

    if (e.key === "Escape") setOpen(false);
  };

  const handleConfirm = async () => {
    if (staged.length === 0) return;
    setSaving(true);

    try {
      await Promise.all(
        staged.map((s) => candidatsApi.addSkill({ nom: s.nom, niveau: s.niveau })),
      );
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(copy.successAdd);
      onClose();
    } catch {
      toast.error(copy.errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={copy.title} onClose={onClose}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxHeight: "65vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div ref={dropRef} style={{ position: "relative" }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#5A7A96",
                marginBottom: 7,
              }}
            >
              {copy.skillLabel}
            </label>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={copy.searchPlaceholder}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 11,
                boxSizing: "border-box",
                border: `1.5px solid ${open ? "#2284C0" : "rgba(16,64,107,0.12)"}`,
                background: open ? "white" : "#FAFAF8",
                boxShadow: open ? "0 0 0 3px rgba(34,132,192,0.08)" : "none",
                outline: "none",
                fontSize: 13,
                color: "#0D2137",
                fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.18s",
              }}
            />

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  background: "white",
                  border: "1.5px solid rgba(16,64,107,0.12)",
                  borderRadius: 10,
                  boxShadow: "0 8px 30px rgba(16,64,107,0.12)",
                  overflow: "hidden",
                }}
              >
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: "4px 0",
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {queryIsNew && !queryAlreadyStaged && (
                    <li
                      onMouseDown={() => stage(query.trim())}
                      style={{
                        padding: "9px 14px",
                        fontSize: 13,
                        color: "#2284C0",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        borderBottom: "1px solid rgba(16,64,107,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(34,132,192,0.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Plus size={13} /> {copy.useValue} "{query.trim()}"
                    </li>
                  )}

                  {queryAlreadyStaged && (
                    <li
                      style={{
                        padding: "9px 14px",
                        fontSize: 13,
                        color: "#B0C4D4",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {copy.alreadyInList}
                    </li>
                  )}

                  {!queryAlreadyStaged && filtered.length === 0 && !queryIsNew && (
                    <li
                      style={{
                        padding: "9px 14px",
                        fontSize: 13,
                        color: "#9BAFC0",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {copy.noResults}
                    </li>
                  )}

                  {filtered.map((o) => (
                    <li
                      key={o.id}
                      onMouseDown={() => stage(o.nom)}
                      style={{
                        padding: "9px 14px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#0D2137",
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(16,64,107,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {o.nom}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#5A7A96",
                marginBottom: 7,
              }}
            >
              {copy.levelLabel} :{" "}
              <span style={{ color: skillColor(niveau) }}>
                {niveau}% - {levelLabel(niveau)}
              </span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={niveau}
              onChange={(e) => setNiveau(+e.target.value)}
              style={{ width: "100%", accentColor: skillColor(niveau) }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#B0C4D4",
                marginTop: 4,
              }}
            >
              <span>{copy.beginnerShort}</span>
              <span>{copy.expertShort}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!query.trim() || queryAlreadyStaged}
            onClick={() => {
              const trimmed = query.trim();
              if (!trimmed) return;
              const exact = options.find(
                (o) => o.nom.toLowerCase() === trimmed.toLowerCase(),
              );
              stage(exact ? exact.nom : trimmed);
            }}
            style={{
              width: "100%",
              padding: "11px",
              background:
                !query.trim() || queryAlreadyStaged
                  ? "rgba(16,64,107,0.06)"
                  : "rgba(34,132,192,0.08)",
              border: `1.5px dashed ${
                !query.trim() || queryAlreadyStaged
                  ? "rgba(16,64,107,0.1)"
                  : "rgba(34,132,192,0.3)"
              }`,
              borderRadius: 11,
              color:
                !query.trim() || queryAlreadyStaged ? "#B0C4D4" : "#2284C0",
              fontSize: 13,
              fontWeight: 700,
              cursor:
                !query.trim() || queryAlreadyStaged ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.18s",
            }}
          >
            <Plus size={14} />
            {query.trim()
              ? `${copy.addAction} "${query.trim()}"`
              : copy.enterSkillAbove}
          </button>
        </div>

        {staged.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#5A7A96",
                marginBottom: 8,
                flexShrink: 0,
              }}
            >
              {copy.toAdd} ({staged.length})
            </div>

            <div
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingRight: 2,
              }}
            >
              {staged.map((s) => {
                const color = skillColor(s.niveau);
                return (
                  <div
                    key={s.nom}
                    style={{
                      background: "#F7F8FA",
                      border: `1px solid ${color}25`,
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0D2137",
                          }}
                        >
                          {s.nom}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color }}>
                          {s.niveau}% - {levelLabel(s.niveau)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStaged(s.nom)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#B0C4D4",
                            display: "flex",
                            alignItems: "center",
                            padding: 0,
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={s.niveau}
                      onChange={(e) => updateStagedNiveau(s.nom, +e.target.value)}
                      style={{ width: "100%", accentColor: color }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ flexShrink: 0 }}>
          <button
            type="button"
            disabled={staged.length === 0 || saving}
            onClick={handleConfirm}
            style={{
              width: "100%",
              padding: "13px",
              background:
                staged.length === 0
                  ? "rgba(16,64,107,0.15)"
                  : saving
                    ? "rgba(16,64,107,0.4)"
                    : "linear-gradient(135deg, #10406B, #2284C0)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor:
                staged.length === 0 || saving ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow:
                staged.length > 0 && !saving
                  ? "0 4px 20px rgba(16,64,107,0.25)"
                  : "none",
            }}
          >
            {saving ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />{" "}
                {copy.saving}
              </>
            ) : staged.length === 0 ? (
              copy.addAtLeastOne
            ) : (
              <>
                <CheckCircle size={14} /> {copy.confirm} {staged.length}{" "}
                {staged.length > 1 ? copy.skillPlural : copy.skillSingular}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
