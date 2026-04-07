// frontend/src/app/admin/components/AdminCreateOfferModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2, Plus } from "lucide-react";
import { Modal } from "./Modal";
import { Field, inputStyle } from "./Field";
import { adminApi, type AdminCreateOffreDto } from "@/lib/api";
import toast from "react-hot-toast";

export function AdminCreateOfferModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titre: "", description: "", type_contrat: "CDI",
    niveau_experience: "", localisation: "",
    salaire_min: undefined as number | undefined,
    salaire_max: undefined as number | undefined,
    competences_str: "",
  });

  const { data: entreprises = [] } = useQuery({
    queryKey: ["admin-entreprises"],
    queryFn: () => adminApi.getAllEntreprises().then((r) => r.data),
  });

  const selectedEnt = entreprises.find((e) => e.id === selectedEntrepriseId);

  const mut = useMutation({
    mutationFn: () => {
      if (!selectedEntrepriseId) throw new Error("Sélectionnez une entreprise");
      const payload: AdminCreateOffreDto = {
        entrepriseId: selectedEntrepriseId,
        titre: form.titre,
        description: form.description,
        type_contrat: form.type_contrat,
        niveau_experience: form.niveau_experience || undefined,
        localisation: form.localisation || undefined,
        salaire_min: form.salaire_min || undefined,
        salaire_max: form.salaire_max || undefined,
        competences: form.competences_str.split(",").map((s) => s.trim()).filter(Boolean),
      };
      return adminApi.createForEntreprise(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      toast.success("Offre créée avec succès !");
      onClose();
    },
    onError: (err: any) => toast.error(err?.message ?? "Erreur"),
  });

  const set = (key: string) => (e: any) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const tags = form.competences_str.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <Modal title="Créer une offre (Admin)" onClose={onClose} wide>
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
        {/* Step 1 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0D2137", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#10406B", color: "white", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1</span>
            Sélectionner l'entreprise
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, maxHeight: 200, overflowY: "auto", padding: 4 }}>
            {entreprises.map((e) => (
              <button
                key={e.id} type="button"
                onClick={() => setSelectedEntrepriseId(e.id)}
                style={{
                  padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                  background: selectedEntrepriseId === e.id ? "rgba(16,64,107,0.06)" : "#F7F8FA",
                  border: `2px solid ${selectedEntrepriseId === e.id ? "#10406B" : "rgba(16,64,107,0.1)"}`,
                }}
              >
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
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #10406B, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", fontFamily: "'Fraunces',serif", flexShrink: 0 }}>
                {selectedEnt.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0D2137" }}>{selectedEnt.nom}</div>
                <div style={{ fontSize: 12, color: "#5A7A96", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {selectedEnt.secteur && <span>{selectedEnt.secteur}</span>}
                  {selectedEnt.localisation && <span>· {selectedEnt.localisation}</span>}
                  <span>· {selectedEnt.utilisateur.email}</span>
                </div>
              </div>
              <CheckCircle size={16} color="#1A9E6F" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div style={{ borderTop: "1px solid rgba(16,64,107,0.07)", paddingTop: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0D2137", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#10406B", color: "white", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>2</span>
            Détails de l'offre
          </div>
        </div>

        <Field label="Titre du poste">
          <input style={inputStyle} value={form.titre} onChange={set("titre")} placeholder="Ex: Senior React Developer" required />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Type de contrat">
            <select style={inputStyle} value={form.type_contrat} onChange={set("type_contrat")}>
              {["CDI", "CDD", "Freelance", "Stage", "Alternance"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Niveau d'expérience">
            <select style={inputStyle} value={form.niveau_experience} onChange={set("niveau_experience")}>
              <option value="">— Sélectionner —</option>
              {["Junior", "Confirmé", "Senior", "Expert"].map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Localisation">
          <input style={inputStyle} value={form.localisation} onChange={set("localisation")} placeholder="Casablanca · Remote" />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Salaire min (MAD/an)">
            <input type="number" style={inputStyle} value={form.salaire_min ?? ""} onChange={(e) => setForm((f) => ({ ...f, salaire_min: e.target.value ? +e.target.value : undefined }))} placeholder="45000" />
          </Field>
          <Field label="Salaire max (MAD/an)">
            <input type="number" style={inputStyle} value={form.salaire_max ?? ""} onChange={(e) => setForm((f) => ({ ...f, salaire_max: e.target.value ? +e.target.value : undefined }))} placeholder="65000" />
          </Field>
        </div>

        <Field label="Compétences (séparées par virgule)">
          <input style={inputStyle} value={form.competences_str} onChange={set("competences_str")} placeholder="React, TypeScript, Node.js…" />
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {tags.map((t) => (
                <span key={t} style={{ background: "rgba(34,132,192,0.1)", color: "#2284C0", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8 }}>{t}</span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Description">
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" } as any} value={form.description} onChange={set("description")} placeholder="Décrivez le poste…" required />
        </Field>

        <button
          type="submit"
          disabled={mut.isPending || !selectedEntrepriseId}
          style={{
            width: "100%", padding: "13px",
            background: !selectedEntrepriseId ? "rgba(16,64,107,0.2)" : mut.isPending ? "rgba(16,64,107,0.4)" : "linear-gradient(135deg, #10406B, #2284C0)",
            border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700,
            cursor: !selectedEntrepriseId || mut.isPending ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: selectedEntrepriseId ? "0 4px 20px rgba(16,64,107,0.25)" : "none",
          }}
        >
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