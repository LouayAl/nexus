// frontend/src/app/company/dashboard/OfferFormModal.tsx
"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { Field, inputStyle } from "./Field";
import { type Offre, type CreateOffreDto } from "./constants";
import { offresApi } from "@/lib/api";

// ── Language pill selector (shared logic, inline here for self-containment) ──
const LANGUE_OPTIONS = [
  "Français", "Anglais", "Arabe", "Espagnol", "Allemand",
  "Italien", "Portugais", "Mandarin", "Japonais", "Russe",
  "Néerlandais", "Turc",
];

function LangueSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (lang: string) =>
    onChange(
      value.includes(lang) ? value.filter((l) => l !== lang) : [...value, lang]
    );

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {LANGUE_OPTIONS.map((lang) => {
          const active = value.includes(lang);
          return (
            <button
              key={lang}
              type="button"
              onClick={() => toggle(lang)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans',sans-serif",
                cursor: "pointer",
                border: `1.5px solid ${active ? "#10406B" : "rgba(16,64,107,0.15)"}`,
                background: active ? "rgba(16,64,107,0.08)" : "transparent",
                color: active ? "#10406B" : "#5A7A96",
                transition: "all 0.15s",
              }}
            >
              {active && "✓ "}{lang}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#5A7A96" }}>
          Sélectionnées : <strong style={{ color: "#10406B" }}>{value.join(", ")}</strong>
        </div>
      )}
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
type FormData = {
  titre:             string;
  type_contrat:      string;
  niveau_experience: string;
  localisation:      string;
  salaire_min:       number | undefined;
  salaire_max:       number | undefined;
  salaire_visible:   boolean;
  description:       string;
  profil_recherche:  string;
  competences_str:   string;
  langues:           string[];
};

interface OfferFormModalProps {
  offre?:   Offre;
  onClose:  () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export function OfferFormModal({ offre, onClose }: OfferFormModalProps) {
  const isEdit = !!offre;

  const [form, setForm] = useState<FormData>(() => ({
    titre:             offre?.titre             ?? "",
    type_contrat:      offre?.type_contrat      ?? "CDI",
    niveau_experience: offre?.niveau_experience ?? "",
    localisation:      offre?.localisation      ?? "",
    salaire_min:       offre?.salaire_min,
    salaire_max:       offre?.salaire_max,
    salaire_visible:   offre?.salaire_visible   ?? true,
    description:       offre?.description       ?? "",
    profil_recherche:  offre?.profil_recherche  ?? "",
    competences_str:   offre?.competences?.map((c: any) => c.competence?.nom).join(", ") ?? "",
    langues:           offre?.langues           ?? [],
  }));

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: CreateOffreDto = {
        titre:            form.titre,
        type_contrat:     form.type_contrat,
        niveau_experience: form.niveau_experience || undefined,
        localisation:     form.localisation       || undefined,
        salaire_min:      form.salaire_min         || undefined,
        salaire_max:      form.salaire_max         || undefined,
        salaire_visible:  form.salaire_visible,
        description:      form.description,
        profil_recherche: form.profil_recherche    || undefined,
        competences:      form.competences_str.split(",").map((s) => s.trim()).filter(Boolean),
        langues:          form.langues,
      };

      if (isEdit) {
        await offresApi.update(offre!.id, payload);
        toast.success("Offre mise à jour !");
      } else {
        await offresApi.create(payload);
        toast.success("Offre créée ! En attente de validation.");
      }
      onClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const competenceTags = form.competences_str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Modal
      title={isEdit ? "Modifier l'offre" : "Créer une nouvelle offre"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>

        {/* ── Titre ─────────────────────────────────────────────────────── */}
        <Field label="Titre du poste">
          <input
            style={inputStyle} value={form.titre}
            onChange={handleChange("titre")}
            placeholder="Ex: Senior React Developer" required
          />
        </Field>

        {/* ── Contrat + Expérience ──────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Type de contrat" half>
            <select style={inputStyle} value={form.type_contrat} onChange={handleChange("type_contrat")}>
              {["CDI", "CDD", "Freelance", "Stage", "Alternance", "Intérim"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Niveau d'expérience" half>
            <select style={inputStyle} value={form.niveau_experience} onChange={handleChange("niveau_experience")}>
              <option value="">— Sélectionner —</option>
              {["Junior", "Confirmé", "Senior", "Expert"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* ── Localisation ──────────────────────────────────────────────── */}
        <Field label="Localisation">
          <input
            style={inputStyle} value={form.localisation}
            onChange={handleChange("localisation")}
            placeholder="Casablanca, Maroc · Remote…"
          />
        </Field>

        {/* ── Salaire (optional) + visibilité ──────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <label style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "#5A7A96",
            }}>
              Salaire (MAD/an) — optionnel
            </label>

            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, salaire_visible: !f.salaire_visible }))}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 99, cursor: "pointer",
                border: `1.5px solid ${form.salaire_visible ? "rgba(26,158,111,0.3)" : "rgba(214,64,69,0.3)"}`,
                background: form.salaire_visible ? "rgba(26,158,111,0.06)" : "rgba(214,64,69,0.06)",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {form.salaire_visible
                ? <><Eye size={11} color="#1A9E6F" /><span style={{ fontSize: 11, fontWeight: 600, color: "#1A9E6F" }}>Visible candidats</span></>
                : <><EyeOff size={11} color="#D64045" /><span style={{ fontSize: 11, fontWeight: 600, color: "#D64045" }}>Masqué candidats</span></>
              }
            </button>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="number" style={inputStyle}
              value={form.salaire_min ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, salaire_min: e.target.value ? +e.target.value : undefined }))}
              placeholder="Min — ex: 45 000"
            />
            <input
              type="number" style={inputStyle}
              value={form.salaire_max ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, salaire_max: e.target.value ? +e.target.value : undefined }))}
              placeholder="Max — ex: 65 000"
            />
          </div>

          {/* Salary preview */}
          {form.salaire_min && form.salaire_max && (
            <div style={{
              marginTop: 8, padding: "10px 14px", borderRadius: 10,
              background: form.salaire_visible
                ? "rgba(26,158,111,0.06)"
                : "rgba(214,64,69,0.05)",
              border: `1px solid ${form.salaire_visible ? "rgba(26,158,111,0.15)" : "rgba(214,64,69,0.15)"}`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {form.salaire_visible
                ? <CheckCircle size={13} color="#1A9E6F" />
                : <EyeOff size={13} color="#D64045" />
              }
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: form.salaire_visible ? "#1A9E6F" : "#D64045",
              }}>
                {Math.round(form.salaire_min / 1000)}K – {Math.round(form.salaire_max / 1000)}K MAD / an
                {!form.salaire_visible && " · masqué pour les candidats"}
              </span>
            </div>
          )}
        </div>

        {/* ── Description du poste ─────────────────────────────────────── */}
        <Field label="Description du poste">
          <textarea
            style={{ ...inputStyle, minHeight: 110, resize: "vertical" } as React.CSSProperties}
            value={form.description} onChange={handleChange("description")}
            placeholder="Décrivez le poste, les missions, le contexte…" required
          />
        </Field>

        {/* ── Profil recherché ─────────────────────────────────────────── */}
        <Field label="Profil recherché">
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" } as React.CSSProperties}
            value={form.profil_recherche} onChange={handleChange("profil_recherche")}
            placeholder="Décrivez le profil idéal : formation, soft skills, expérience attendue…"
          />
        </Field>

        {/* ── Compétences ──────────────────────────────────────────────── */}
        <Field label="Compétences requises (séparées par virgule)">
          <input
            style={inputStyle} value={form.competences_str}
            onChange={handleChange("competences_str")}
            placeholder="React, TypeScript, Node.js…"
          />
          {competenceTags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {competenceTags.map((s) => (
                <span key={s} style={{
                  background: "rgba(34,132,192,0.1)", color: "#2284C0",
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8,
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </Field>

        {/* ── Langues ──────────────────────────────────────────────────── */}
        <Field label="Langues requises">
          <LangueSelect
            value={form.langues}
            onChange={(v) => setForm((f) => ({ ...f, langues: v }))}
          />
        </Field>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%", padding: "12px 16px",
            background: isLoading
              ? "rgba(16,64,107,0.4)"
              : "linear-gradient(135deg, #10406B, #2284C0)",
            border: "none", borderRadius: 12, color: "white",
            fontSize: 14, fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: isLoading ? "none" : "0 4px 20px rgba(16,64,107,0.25)",
            marginTop: 8,
          }}
        >
          {isLoading
            ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Enregistrement…</>
            : <>{isEdit ? "Mettre à jour" : "Publier l'offre"}<ArrowRight size={14} /></>
          }
        </button>
      </form>
    </Modal>
  );
}