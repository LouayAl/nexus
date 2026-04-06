// OfferFormModal.tsx - Fixed version
"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { Field, inputStyle } from "./Field";
import { type Offre, type CreateOffreDto } from "./constants";
import { offresApi } from "@/lib/api";

type FormData = {
  titre: string;
  description: string;
  type_contrat: string;
  niveau_experience: string;
  localisation: string;
  salaire_min: number | undefined;
  salaire_max: number | undefined;
  competences_str: string;
  competences: string[];
};

interface OfferFormModalProps {
  offre?: Offre;
  onClose: () => void;
}

export function OfferFormModal({ offre, onClose }: OfferFormModalProps) {
  const isEdit = !!offre;

  const [form, setForm] = useState<FormData>(() => ({
    titre: offre?.titre ?? "",
    description: offre?.description ?? "",
    type_contrat: offre?.type_contrat ?? "CDI",
    niveau_experience: offre?.niveau_experience ?? "",
    localisation: offre?.localisation ?? "",
    salaire_min: offre?.salaire_min,
    salaire_max: offre?.salaire_max,
    competences_str: offre?.competences?.map((c: any) => c.competence?.nom).join(", ") ?? "",
    competences: [],
  }));

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: CreateOffreDto = {
        titre: form.titre,
        description: form.description,
        type_contrat: form.type_contrat,
        niveau_experience: form.niveau_experience || undefined,
        localisation: form.localisation || undefined,
        salaire_min: form.salaire_min || undefined,
        salaire_max: form.salaire_max || undefined,
        competences: form.competences_str.split(",").map((s: string) => s.trim()).filter(Boolean),
      };
      
      if (isEdit) {
        await offresApi.update(offre!.id, payload);
        toast.success("Offre mise à jour !");
      } else {
        await offresApi.create(payload);
        toast.success("Offre créée ! En attente de validation.");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "number" ? (e.target.value ? +e.target.value : undefined) : e.target.value;
    setForm((f: FormData) => ({ ...f, [key]: value }));
  };

  const competenceTags = form.competences_str.split(",").map((s: string) => s.trim()).filter(Boolean);

  return (
    <Modal title={isEdit ? "Modifier l'offre" : "Créer une nouvelle offre"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Titre du poste">
          <input style={inputStyle} value={form.titre} onChange={handleChange("titre")} placeholder="Ex: Senior React Developer" required />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Type de contrat" half>
            <select style={inputStyle} value={form.type_contrat} onChange={handleChange("type_contrat")}>
              {["CDI", "CDD", "Freelance", "Stage", "Alternance"].map((t: string) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Niveau d'expérience" half>
            <select style={inputStyle} value={form.niveau_experience} onChange={handleChange("niveau_experience")}>
              <option value="">— Sélectionner —</option>
              {["Junior", "Confirmé", "Senior", "Expert"].map((n: string) => <option key={n}>{n}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Localisation">
          <input style={inputStyle} value={form.localisation} onChange={handleChange("localisation")} placeholder="Paris · Remote, Lyon…" />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Salaire min ( MAD/an)" half>
            <input type="number" style={inputStyle} value={form.salaire_min ?? ""} onChange={(e) => setForm((f: FormData) => ({ ...f, salaire_min: e.target.value ? +e.target.value : undefined }))} placeholder="45000" />
          </Field>
          <Field label="Salaire max ( MAD/an)" half>
            <input type="number" style={inputStyle} value={form.salaire_max ?? ""} onChange={(e) => setForm((f: FormData) => ({ ...f, salaire_max: e.target.value ? +e.target.value : undefined }))} placeholder="65000" />
          </Field>
        </div>

        <Field label="Compétences requises (séparées par virgule)">
          <input style={inputStyle} value={form.competences_str} onChange={handleChange("competences_str")} placeholder="React, TypeScript, Node.js…" />
          {form.competences_str && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {competenceTags.map((s: string) => (
                <span key={s} style={{ background: "rgba(34,132,192,0.1)", color: "#2284C0", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8 }}>{s}</span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Description du poste">
          <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" } as React.CSSProperties} value={form.description} onChange={handleChange("description")} placeholder="Décrivez le poste…" required />
        </Field>

        {form.salaire_min && form.salaire_max && (
          <div style={{ background: "rgba(26,158,111,0.06)", border: "1px solid rgba(26,158,111,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle size={15} color="#1A9E6F" />
            <span style={{ fontSize: 13, color: "#1A9E6F", fontWeight: 600 }}>
              Rémunération : {Math.round(form.salaire_min / 1000)}K – {Math.round(form.salaire_max / 1000)}K  MAD / an
            </span>
          </div>
        )}

        <button 
            type="submit" 
            disabled={isLoading} 
            style={{ 
                width: "100%", 
                padding: "10px 16px",  // Less vertical padding for slimmer look
                background: isLoading ? "rgba(16,64,107,0.4)" : "linear-gradient(135deg, #10406B, #2284C0)", 
                border: "none", 
                borderRadius: 12, 
                color: "white", 
                fontSize: 14, 
                fontWeight: 700, 
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 8  // Space between text and arrow
            }}
            >
            {isLoading ? (
                <>
                <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> 
                Enregistrement…
                </>
            ) : (
                <>
                {isEdit ? "Mettre à jour" : "Publier l'offre"} 
                <ArrowRight size={14} />
                </>
            )}
        </button>
      </form>
    </Modal>
  );
}