// frontend/src/app/admin/components/CreateCandidatModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { Modal } from "./Modal";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { LocationInput } from "@/components/ui/LocationInput";

export function CreateCandidatModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    prenom:       "",
    nom:          "",
    email:        "",
    password:     "",
    telephone:    "",
    titre:        "",
    localisation: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => adminApi.createCandidat(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidats"] });
      toast.success("Candidat créé avec succès");
      onClose();
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid rgba(16,64,107,0.15)", fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", color: "#0D2137",
    background: "#F7F8FA", outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#5A7A96",
    marginBottom: 5, display: "block",
  };

  return (
    <Modal title="Créer un candidat" onClose={onClose}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={labelStyle}>Prénom *</label>
            <input style={inputStyle} value={form.prenom} onChange={set("prenom")} placeholder="Jean"/>
          </div>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input style={inputStyle} value={form.nom} onChange={set("nom")} placeholder="Dupont"/>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="jean@example.com"/>
        </div>

        <div>
          <label style={labelStyle}>Mot de passe *</label>
          <input style={inputStyle} type="password" value={form.password} onChange={set("password")} placeholder="••••••••"/>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input style={inputStyle} value={form.telephone} onChange={set("telephone")} placeholder="+212 6XX XXX XXX"/>
          </div>
          <div>
            <label style={labelStyle}>Localisation</label>
            <LocationInput
              style={inputStyle}
              value={form.localisation}
              onChange={v => setForm(f => ({ ...f, localisation: v }))}
              placeholder="Tanger, Maroc"
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Titre / Poste</label>
          <input style={inputStyle} value={form.titre} onChange={set("titre")} placeholder="Développeur Full Stack"/>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button
            onClick={onClose}
            style={{ flex:1, padding:"11px", borderRadius:11, border:"1px solid rgba(16,64,107,0.15)", background:"white", color:"#5A7A96", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          >
            Annuler
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.prenom || !form.nom || !form.email || !form.password}
            style={{ flex:2, padding:"11px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#1A9E6F,#0d7a54)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:mutation.isPending ? 0.7 : 1 }}
          >
            {mutation.isPending
              ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/>
              : <UserPlus size={14}/>
            }
            {mutation.isPending ? "Création…" : "Créer le candidat"}
          </button>
        </div>

      </div>
    </Modal>
  );
}