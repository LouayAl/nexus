// frontend/src/app/profile/_components/AddSkillModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";

export function AddSkillModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState(70);

  const mut = useMutation({
    mutationFn: () => candidatsApi.addSkill({ nom, niveau }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["profile"] });
      toast.success("Compétence ajoutée");
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  return (
    <Modal title="Ajouter une compétence" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Nom de la compétence">
          <input style={inputSx} value={nom} onChange={e => setNom(e.target.value)} placeholder="React, Python, Figma…" required/>
        </Field>
        <Field label={`Niveau : ${niveau}%`}>
          <input type="range" min={10} max={100} step={5} value={niveau} onChange={e => setNiveau(+e.target.value)} style={{ width:"100%", accentColor:"#2284C0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#B0C4D4", marginTop:4 }}>
            <span>Débutant</span><span>Expert</span>
          </div>
        </Field>
        <SubmitBtn loading={mut.isPending} label="Ajouter"/>
      </form>
    </Modal>
  );
}