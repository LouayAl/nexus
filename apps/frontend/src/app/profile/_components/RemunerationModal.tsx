"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { candidatsApi, type CandidatProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import type { AppLanguage } from "@/hooks/useAppLanguage";

const COPY = {
  fr: {
    title:                  "Rémunération & Prétentions",
    salaireActuel:          "Salaire actuel / dernier",
    salairePlaceholder:     "Ex: 15 000 MAD / mois",
    avantagesNature:        "Avantages en nature",
    primes:                 "Primes",
    vehiculeFonction:       "Véhicule de fonction",
    vehiculeService:        "Véhicule de service",
    avantagesSociaux:       "Avantages sociaux",
    autrePlaceholder:       "Autre avantage…",
    ajouter:                "+ Ajouter",
    pretentions:            "Prétentions salariales",
    pretentionsPlaceholder: "Ex: 18 000 MAD / mois",
    save:                   "Enregistrer",
    saving:                 "Enregistrement…",
    success:                "Rémunération mise à jour",
    error:                  "Erreur lors de la mise à jour",
  },
  en: {
    title:                  "Compensation & Expectations",
    salaireActuel:          "Current / last salary",
    salairePlaceholder:     "E.g. 15,000 MAD / month",
    avantagesNature:        "Benefits in kind",
    primes:                 "Bonuses",
    vehiculeFonction:       "Company car",
    vehiculeService:        "Service vehicle",
    avantagesSociaux:       "Social benefits",
    autrePlaceholder:       "Other benefit…",
    ajouter:                "+ Add",
    pretentions:            "Salary expectations",
    pretentionsPlaceholder: "E.g. 18,000 MAD / month",
    save:                   "Save",
    saving:                 "Saving…",
    success:                "Compensation updated",
    error:                  "Error updating compensation",
  },
} as const;

const AVANTAGES_PRESET = [
  "CNSS", "CIMR", "Mutuelle", "Assurance maladie",
  "Retraite complémentaire", "Tickets restaurant", "Formation continue",
];

interface Props {
  profile:  CandidatProfile;
  onClose:  () => void;
  language: AppLanguage;  // ✅ in interface
}

export function RemunerationModal({ profile, onClose, language }: Props) {  // ✅ destructured
  const qc   = useQueryClient();
  const copy = COPY[language];  // ✅ derived

  const [salaireActuel,         setSalaireActuel]         = useState(profile.salaireActuel         ?? "");
  const [primes,                setPrimes]                = useState(profile.primes                ?? false);
  const [vehiculeFonction,      setVehiculeFonction]      = useState(profile.vehiculeFonction      ?? false);
  const [vehiculeService,       setVehiculeService]       = useState(profile.vehiculeService       ?? false);
  const [avantagesSociaux,      setAvantagesSociaux]      = useState<string[]>(profile.avantagesSociaux ?? []);
  const [pretentionsSalariales, setPretentionsSalariales] = useState(profile.pretentionsSalariales ?? "");
  const [customAvantage,        setCustomAvantage]        = useState("");

  const mut = useMutation({
    mutationFn: () => candidatsApi.updateRemuneration({
      salaireActuel:         salaireActuel         || undefined,
      primes,
      vehiculeFonction,
      vehiculeService,
      avantagesSociaux,
      pretentionsSalariales: pretentionsSalariales || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(copy.success);  // ✅
      onClose();
    },
    onError: () => toast.error(copy.error),  // ✅
  });

  const toggleAvantage = (a: string) =>
    setAvantagesSociaux(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );

  const addCustom = () => {
    const trimmed = customAvantage.trim();
    if (trimmed && !avantagesSociaux.includes(trimmed))
      setAvantagesSociaux(prev => [...prev, trimmed]);
    setCustomAvantage("");
  };

  const iSx: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid rgba(16,64,107,0.12)", outline: "none",
    fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif",
    background: "#FAFAF8", boxSizing: "border-box",
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:"#F7F8FA", borderRadius:10, border:"1px solid rgba(16,64,107,0.08)" }}>
      <span style={{ fontSize:13, color:"#0D2137", fontWeight:500 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{ width:44, height:24, borderRadius:99, border:"none", background: value ? "#1A9E6F" : "rgba(16,64,107,0.12)", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}
      >
        <div style={{ position:"absolute", top:2, left: value ? 22 : 2, width:20, height:20, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }}/>
      </button>
    </div>
  );

  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24, pointerEvents:"none" }}>
        <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:500, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(16,64,107,0.2)", pointerEvents:"all" }}>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(16,64,107,0.07)", flexShrink:0 }}>
            <h3 className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>
              {copy.title}  {/* ✅ */}
            </h3>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color="#5A7A96"/>
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>

            {/* Salaire actuel */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>
                {copy.salaireActuel}  {/* ✅ */}
              </label>
              <input
                style={iSx}
                value={salaireActuel}
                onChange={e => setSalaireActuel(e.target.value)}
                placeholder={copy.salairePlaceholder}
                onFocus={e => (e.target.style.borderColor = "#2284C0")}
                onBlur={e  => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
              />
            </div>

            {/* Avantages en nature */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>
                {copy.avantagesNature}  {/* ✅ */}
              </label>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <Toggle label={copy.primes}           value={primes}           onChange={setPrimes}           />  {/* ✅ */}
                <Toggle label={copy.vehiculeFonction} value={vehiculeFonction} onChange={setVehiculeFonction} />  {/* ✅ */}
                <Toggle label={copy.vehiculeService}  value={vehiculeService}  onChange={setVehiculeService}  />  {/* ✅ */}
              </div>
            </div>

            {/* Avantages sociaux */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>
                {copy.avantagesSociaux}  {/* ✅ */}
              </label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 }}>
                {AVANTAGES_PRESET.map(a => {
                  const selected = avantagesSociaux.includes(a);
                  return (
                    <button
                      key={a} type="button"
                      onClick={() => toggleAvantage(a)}
                      style={{ padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", border:`1.5px solid ${selected ? "#2284C0" : "rgba(16,64,107,0.15)"}`, background: selected ? "rgba(34,132,192,0.1)" : "#FAFAF8", color: selected ? "#2284C0" : "#5A7A96", transition:"all 0.15s" }}
                    >
                      {selected ? "✓ " : ""}{a}
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  style={{ ...iSx, flex:1 }}
                  value={customAvantage}
                  onChange={e => setCustomAvantage(e.target.value)}
                  placeholder={copy.autrePlaceholder}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                  onFocus={e => (e.target.style.borderColor = "#2284C0")}
                  onBlur={e  => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
                />
                <button
                  type="button" onClick={addCustom}
                  style={{ padding:"11px 14px", borderRadius:10, background:"rgba(34,132,192,0.08)", border:"1px solid rgba(34,132,192,0.2)", color:"#2284C0", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}
                >
                  {copy.ajouter}  {/* ✅ */}
                </button>
              </div>
              {avantagesSociaux.filter(a => !AVANTAGES_PRESET.includes(a)).length > 0 && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                  {avantagesSociaux.filter(a => !AVANTAGES_PRESET.includes(a)).map(a => (
                    <span key={a} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99, background:"rgba(238,129,61,0.08)", border:"1px solid rgba(238,129,61,0.2)", color:"#EE813D", fontSize:12, fontWeight:600 }}>
                      {a}
                      <button type="button" onClick={() => setAvantagesSociaux(prev => prev.filter(x => x !== a))} style={{ background:"none", border:"none", cursor:"pointer", color:"#EE813D", padding:0, fontSize:14, lineHeight:1 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prétentions salariales */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>
                {copy.pretentions}  {/* ✅ */}
              </label>
              <input
                style={iSx}
                value={pretentionsSalariales}
                onChange={e => setPretentionsSalariales(e.target.value)}
                placeholder={copy.pretentionsPlaceholder}
                onFocus={e => (e.target.style.borderColor = "#2284C0")}
                onBlur={e  => (e.target.style.borderColor = "rgba(16,64,107,0.12)")}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(16,64,107,0.07)", flexShrink:0 }}>
            <button
              onClick={() => mut.mutate()}
              disabled={mut.isPending}
              style={{ width:"100%", padding:"12px", background: mut.isPending ? "rgba(16,64,107,0.4)" : "linear-gradient(135deg, #10406B, #2284C0)", border:"none", borderRadius:11, color:"white", fontSize:14, fontWeight:700, cursor: mut.isPending ? "not-allowed" : "pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            >
              {mut.isPending ? copy.saving : copy.save}  {/* ✅ */}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}