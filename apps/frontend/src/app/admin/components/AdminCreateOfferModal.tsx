"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2, Plus, Eye, EyeOff, Building2 } from "lucide-react";
import { Modal } from "./Modal";
import { Field, inputStyle } from "./Field";
import { adminApi, type AdminCreateOffreDto } from "@/lib/api";
import toast from "react-hot-toast";
import { LocationInput } from "@/components/ui/LocationInput";
import { ColoredSelect } from "./ColoredSelect";
import { CompetenceSelect } from "./CompetenceSelect";
import { useDraftState } from "@/hooks/useDraftState";
import { RichTextEditor } from "@/components/ui/RichTextEditor";



const LANGUE_OPTIONS = [
  "Français", "Anglais", "Arabe", "Espagnol", "Allemand",
  "Italien", "Portugais", "Mandarin", "Japonais", "Russe",
  "Néerlandais", "Turc",
];

function LangueSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (lang: string) =>
    onChange(value.includes(lang) ? value.filter(l => l !== lang) : [...value, lang]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {LANGUE_OPTIONS.map(lang => {
          const active = value.includes(lang);
          return (
            <button key={lang} type="button" onClick={() => toggle(lang)} style={{
              padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
              border: `1.5px solid ${active ? "#10406B" : "rgba(16,64,107,0.15)"}`,
              background: active ? "rgba(16,64,107,0.08)" : "transparent",
              color: active ? "#10406B" : "#5A7A96", transition: "all 0.15s",
            }}>
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

function SectionStep({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#0D2137", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#10406B", color: "white", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
      {label}
    </div>
  );
}

export function AdminCreateOfferModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  const [selectedEntrepriseId, setSelectedEntrepriseId, clearSelectedEntreprise] =
    useDraftState<number | null>("draft:offer-create:entrepriseId", null);  
    
  const [form, setForm, clearForm] = useDraftState("draft:offer-create:form", {
    titre:              "",
    type_contrat:       "CDI",
    niveau_experience:  "Senior",
    localisation:       "",
    salaire_min:        undefined as number | undefined,
    salaire_max:        undefined as number | undefined,
    salaire_visible:    true,
    entreprise_visible: true,
    description:        "",
    profil_recherche:   "",
    competences:        [] as string[],
    langues:            [] as string[],
  });

  const { data: entreprises = [] } = useQuery({
    queryKey: ["admin-entreprises"],
    queryFn:  () => adminApi.getAllEntreprises().then(r => r.data),
  });

  const selectedEnt = entreprises.find(e => e.id === selectedEntrepriseId);

  const mut = useMutation({
    mutationFn: () => {
      if (!selectedEntrepriseId) throw new Error("Sélectionnez une entreprise");
      const payload: AdminCreateOffreDto & { entreprise_visible: boolean } = {
        entrepriseId:       selectedEntrepriseId,
        titre:              form.titre,
        type_contrat:       form.type_contrat,
        niveau_experience:  form.niveau_experience || undefined,
        localisation:       form.localisation      || undefined,
        salaire_min:        form.salaire_min        || undefined,
        salaire_max:        form.salaire_max        || undefined,
        salaire_visible:    form.salaire_visible,
        entreprise_visible: form.entreprise_visible,
        description:        form.description,
        profil_recherche:   form.profil_recherche   || undefined,
        competences:        form.competences,
        langues:            form.langues,
      };
      return adminApi.createForEntreprise(payload as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      toast.success("Offre créée avec succès !");
      clearForm();
      clearSelectedEntreprise();
      onClose();
    },
    onError: (err: any) => toast.error(err?.message ?? "Erreur"),
  });

  const set = (key: keyof typeof form) => (e: any) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <Modal title="Créer une offre (Admin)" onClose={onClose} wide>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>

        {/* ── Step 1: Entreprise ── */}
        <div style={{ marginBottom: 24 }}>
          <SectionStep n={1} label="Sélectionner l'entreprise" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, maxHeight: 200, overflowY: "auto", padding: 4 }}>
            {entreprises.map(e => (
              <button key={e.id} type="button" onClick={() => setSelectedEntrepriseId(e.id)} style={{
                padding: "12px 14px", borderRadius: 12, textAlign: "left",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                background: selectedEntrepriseId === e.id ? "rgba(16,64,107,0.06)" : "#F7F8FA",
                border: `2px solid ${selectedEntrepriseId === e.id ? "#10406B" : "rgba(16,64,107,0.1)"}`,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #10406B, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "'Fraunces',serif" }}>
                  {e.nom.charAt(0)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, color: selectedEntrepriseId === e.id ? "#10406B" : "#0D2137", marginBottom: 2 }}>{e.nom}</div>
                {e.secteur && <div style={{ fontSize: 10, color: "#5A7A96" }}>{e.secteur}</div>}
                <div style={{ fontSize: 10, color: "#B0C4D4", marginTop: 2 }}>{e._count.offres} offre{e._count.offres !== 1 ? "s" : ""}</div>
              </button>
            ))}
          </div>

          {selectedEnt && (
            <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(16,64,107,0.04)", borderRadius: 12, border: "1px solid rgba(16,64,107,0.1)", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, #10406B, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", fontFamily: "'Fraunces',serif" }}>
                {selectedEnt.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0D2137" }}>{selectedEnt.nom}</div>
                <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {selectedEnt.secteur      && <span>{selectedEnt.secteur}</span>}
                  {selectedEnt.localisation && <span>· {selectedEnt.localisation}</span>}
                  <span>· {selectedEnt.utilisateur.email}</span>
                </div>
              </div>
              <CheckCircle size={16} color="#1A9E6F" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </div>
          )}
        </div>
        {/* ── Visibilité entreprise ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96" }}>
              Nom de l'entreprise
            </label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, entreprise_visible: !f.entreprise_visible }))}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 99, cursor: "pointer",
                border: `1.5px solid ${form.entreprise_visible ? "rgba(26,158,111,0.3)" : "rgba(214,64,69,0.3)"}`,
                background: form.entreprise_visible ? "rgba(26,158,111,0.06)" : "rgba(214,64,69,0.06)",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {form.entreprise_visible
                ? <><Eye size={11} color="#1A9E6F" /><span style={{ fontSize: 11, fontWeight: 600, color: "#1A9E6F" }}>Visible pour les candidats</span></>
                : <><EyeOff size={11} color="#D64045" /><span style={{ fontSize: 11, fontWeight: 600, color: "#D64045" }}>Masqué — affiche "Confidentiel"</span></>
              }
            </button>
          </div>
          {!form.entreprise_visible && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(214,64,69,0.04)", border: "1px solid rgba(214,64,69,0.15)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Building2 size={13} color="#D64045" />
              <span style={{ fontSize: 12, color: "#D64045", fontWeight: 600 }}>
                Les candidats verront "Confidentiel" à la place du nom de l'entreprise.
              </span>
            </div>
          )}
        </div>

        {/* ── Step 2: Informations ── */}
        <div style={{ borderTop: "1px solid rgba(16,64,107,0.07)", paddingTop: 20, marginBottom: 16 }}>
          <SectionStep n={2} label="Informations du poste" />
        </div>

        <Field label="Titre du poste">
          <input style={inputStyle} value={form.titre} onChange={set("titre")}
            placeholder="Ex: Senior React Developer" required />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Type de contrat">
            <ColoredSelect
              value={form.type_contrat}
              onChange={v => setForm(f => ({ ...f, type_contrat: v }))}
              options={[
                { value: "CDI",        label: "CDI",        color: "#1A9E6F" },
                { value: "CDD",        label: "CDD",        color: "#2284C0" },
                { value: "Intérim",    label: "Intérim",    color: "#EE813D" },
                { value: "Freelance",  label: "Freelance",  color: "#7C3AED" },
                { value: "Stage",      label: "Stage",      color: "#D64045" },
                { value: "Alternance", label: "Alternance", color: "#10406B" },
              ]}
            />
          </Field>
          <Field label="Niveau d'expérience">
            <ColoredSelect
              value={form.niveau_experience}
              onChange={v => setForm(f => ({ ...f, niveau_experience: v }))}
              options={[
                { value: "Junior",   label: "Junior",   color: "#1A9E6F" },
                { value: "Confirmé", label: "Confirmé", color: "#2284C0" },
                { value: "Senior",   label: "Senior",   color: "#EE813D" },
                { value: "Expert",   label: "Expert",   color: "#7C3AED" },
              ]}
            />
          </Field>
        </div>

        <Field label="Localisation">
          <LocationInput style={inputStyle} value={form.localisation}
            onChange={v => setForm(f => ({ ...f, localisation: v }))}
            placeholder="Tanger, Maroc" />
        </Field>

        

        {/* ── Salaire ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96" }}>
              Salaire (MAD/mois) — optionnel
            </label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, salaire_visible: !f.salaire_visible }))}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 99, cursor: "pointer",
                border: `1.5px solid ${form.salaire_visible ? "rgba(26,158,111,0.3)" : "rgba(214,64,69,0.3)"}`,
                background: form.salaire_visible ? "rgba(26,158,111,0.06)" : "rgba(214,64,69,0.06)",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {form.salaire_visible
                ? <><Eye size={11} color="#1A9E6F" /><span style={{ fontSize: 11, fontWeight: 600, color: "#1A9E6F" }}>Visible pour les candidats</span></>
                : <><EyeOff size={11} color="#D64045" /><span style={{ fontSize: 11, fontWeight: 600, color: "#D64045" }}>Masqué pour les candidats</span></>
              }
            </button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input type="number" style={inputStyle} value={form.salaire_min ?? ""}
              onChange={e => setForm(f => ({ ...f, salaire_min: e.target.value ? +e.target.value : undefined }))}
              placeholder="Min — ex: 45 000" />
            <input type="number" style={inputStyle} value={form.salaire_max ?? ""}
              onChange={e => setForm(f => ({ ...f, salaire_max: e.target.value ? +e.target.value : undefined }))}
              placeholder="Max — ex: 65 000" />
          </div>
          {!form.salaire_visible && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(214,64,69,0.05)", border: "1px solid rgba(214,64,69,0.15)", fontSize: 11, color: "#D64045", display: "flex", alignItems: "center", gap: 6 }}>
              <EyeOff size={11} /> Le salaire sera visible uniquement pour les admins et l'entreprise.
            </div>
          )}
        </div>

        {/* ── Step 3: Contenu ── */}
        <div style={{ borderTop: "1px solid rgba(16,64,107,0.07)", paddingTop: 20, marginBottom: 16 }}>
          <SectionStep n={3} label="Contenu de l'offre" />
        </div>

        <Field label="Description du poste">
          <RichTextEditor
            value={form.description}
            onChange={html => setForm(f => ({ ...f, description: html }))}
            placeholder="Décrivez le poste, les missions, le contexte…"
            minHeight={120}
          />
        </Field>

        <Field label="Profil recherché">
          <RichTextEditor
            value={form.profil_recherche}
            onChange={html => setForm(f => ({ ...f, profil_recherche: html }))}
            placeholder="Décrivez le profil idéal : formation, soft skills, expérience attendue…"
            minHeight={100}
          />
        </Field>

        <Field label="Compétences requises">
          <CompetenceSelect value={form.competences} onChange={v => setForm(f => ({ ...f, competences: v }))} />
        </Field>

        <Field label="Langues requises">
          <LangueSelect value={form.langues} onChange={v => setForm(f => ({ ...f, langues: v }))} />
        </Field>

        {/* ── Submit ── */}
        <button type="submit" disabled={mut.isPending || !selectedEntrepriseId} style={{
          width: "100%", padding: "13px",
          background: !selectedEntrepriseId ? "rgba(16,64,107,0.2)" : mut.isPending ? "rgba(16,64,107,0.4)" : "linear-gradient(135deg, #10406B, #2284C0)",
          border: "none", borderRadius: 12, color: "white",
          fontSize: 14, fontWeight: 700,
          cursor: !selectedEntrepriseId || mut.isPending ? "not-allowed" : "pointer",
          fontFamily: "'DM Sans',sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: selectedEntrepriseId ? "0 4px 20px rgba(16,64,107,0.25)" : "none",
          marginTop: 8,
        }}>
          {mut.isPending
            ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Création…</>
            : !selectedEntrepriseId
            ? "Sélectionnez d'abord une entreprise"
            : <><Plus size={14} /> Créer l'offre pour {selectedEnt?.nom}</>
          }
        </button>
      </form>
    </Modal>
  );
}