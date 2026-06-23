"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi, offresApi, type Offre } from "@/lib/api";
import toast from "react-hot-toast";
import { Check, X, Eye, EyeOff, Building2 } from "lucide-react";

const CONTRATS  = ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Interim"];
const NIVEAUX   = ["Junior", "Confirmé", "Senior", "Expert"];
const STATUTS   = [
  { value: "OUVERTE",    label: "Ouverte"    },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "FERMEE",     label: "Fermée"     },
];

const iSx: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid rgba(16,64,107,0.12)", outline: "none",
  fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif",
  background: "#FAFAF8", boxSizing: "border-box",
};

const labelSx: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.07em",
  color: "#5A7A96", marginBottom: 6,
};

interface Props {
  offre:        Offre;
  entrepriseId: number;
  onDone:       () => void;
}

export function OffreEditPanel({ offre, onDone }: Props) {
  const [titre,              setTitre]              = useState(offre.titre);
  const [description,        setDescription]        = useState(offre.description);
  const [profil,             setProfil]             = useState(offre.profil_recherche ?? "");
  const [contrat,            setContrat]            = useState(offre.type_contrat);
  const [niveau,             setNiveau]             = useState(offre.niveau_experience ?? "");
  const [localisation,       setLocalisation]       = useState(offre.localisation ?? "");
  const [salaireMin,         setSalaireMin]         = useState(String(offre.salaire_min ?? ""));
  const [salaireMax,         setSalaireMax]         = useState(String(offre.salaire_max ?? ""));
  const [statut,             setStatut]             = useState(offre.statut);
  const [entrepriseVisible,  setEntrepriseVisible]  = useState((offre as any).entreprise_visible ?? true);
  const [competences,        setCompetences]        = useState(
    offre.competences?.map((c: any) => c.competence.nom).join(", ") ?? ""
  );
  const [langues, setLangues] = useState(
    offre.langues?.join(", ") ?? ""
  );

  const mut = useMutation({
    mutationFn: () => {
      const comps = competences.split(",").map(s => s.trim()).filter(Boolean);
      const langs = langues.split(",").map(s => s.trim()).filter(Boolean);
      return offresApi.update(offre.id, {
        titre, description,
        profil_recherche:   profil        || undefined,
        type_contrat:       contrat,
        niveau_experience:  niveau        || undefined,
        localisation:       localisation  || undefined,
        salaire_min:        salaireMin    ? Number(salaireMin) : undefined,
        salaire_max:        salaireMax    ? Number(salaireMax) : undefined,
        entreprise_visible: entrepriseVisible,
        competences:        comps.length  ? comps : undefined,
        langues:            langs.length  ? langs : undefined,
      });
    },
    onSuccess: async () => {
      if (statut !== offre.statut) {
        await adminApi.updateOffreStatut(offre.id, statut);
      }
      toast.success("Offre mise à jour");
      onDone();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        
        
        {/* ── Visibilité entreprise ── */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={labelSx}>Nom de l'entreprise</label>
            <button
              type="button"
              onClick={() => setEntrepriseVisible((v: boolean) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 99, cursor: "pointer",
                border: `1.5px solid ${entrepriseVisible ? "rgba(26,158,111,0.3)" : "rgba(214,64,69,0.3)"}`,
                background: entrepriseVisible ? "rgba(26,158,111,0.06)" : "rgba(214,64,69,0.06)",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {entrepriseVisible
                ? <><Eye size={11} color="#1A9E6F" /><span style={{ fontSize: 11, fontWeight: 600, color: "#1A9E6F" }}>Visible pour les candidats</span></>
                : <><EyeOff size={11} color="#D64045" /><span style={{ fontSize: 11, fontWeight: 600, color: "#D64045" }}>Masqué — affiche "Confidentiel"</span></>
              }
            </button>
          </div>
          {!entrepriseVisible && (
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

        {/* Titre */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelSx}>Titre</label>
          <input style={iSx} value={titre} onChange={e => setTitre(e.target.value)} />
        </div>

        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelSx}>Description</label>
          <textarea
            style={{ ...iSx, minHeight: 120, resize: "vertical" }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Profil recherché */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelSx}>Profil recherché</label>
          <textarea
            style={{ ...iSx, minHeight: 90, resize: "vertical" }}
            value={profil}
            onChange={e => setProfil(e.target.value)}
            placeholder="Décrivez le profil idéal pour ce poste…"
          />
        </div>

        {/* Compétences */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelSx}>Compétences (séparées par virgule)</label>
          <input style={iSx} value={competences} onChange={e => setCompetences(e.target.value)} placeholder="React, Node.js, SQL…" />
        </div>

        {/* Langues */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelSx}>Langues (séparées par virgule)</label>
          <input style={iSx} value={langues} onChange={e => setLangues(e.target.value)} placeholder="Français, Anglais…" />
        </div>

        {/* Contrat */}
        <div>
          <label style={labelSx}>Type de contrat</label>
          <select style={iSx} value={contrat} onChange={e => setContrat(e.target.value)}>
            {CONTRATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Niveau */}
        <div>
          <label style={labelSx}>Niveau d'expérience</label>
          <select style={iSx} value={niveau} onChange={e => setNiveau(e.target.value)}>
            <option value="">—</option>
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Localisation */}
        <div>
          <label style={labelSx}>Localisation</label>
          <input style={iSx} value={localisation} onChange={e => setLocalisation(e.target.value)} placeholder="Casablanca…" />
        </div>

        {/* Statut */}
        <div>
          <label style={labelSx}>Statut</label>
          <select style={iSx} value={statut} onChange={e => setStatut(e.target.value)}>
            {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Salaire */}
        <div>
          <label style={labelSx}>Salaire min (MAD)</label>
          <input style={iSx} type="number" value={salaireMin} onChange={e => setSalaireMin(e.target.value)} placeholder="8000" />
        </div>
        <div>
          <label style={labelSx}>Salaire max (MAD)</label>
          <input style={iSx} type="number" value={salaireMax} onChange={e => setSalaireMax(e.target.value)} placeholder="12000" />
        </div>

      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10406B,#2284C0)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", opacity: mut.isPending ? 0.7 : 1 }}
        >
          <Check size={14} /> {mut.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          onClick={onDone}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(16,64,107,0.12)", background: "white", color: "#5A7A96", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
        >
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}