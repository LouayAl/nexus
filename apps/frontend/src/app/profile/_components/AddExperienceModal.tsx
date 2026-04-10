// frontend/src/app/profile/_components/AddExperienceModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type ExperienceDto } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";

export function AddExperienceModal({
  onClose, existing,
}: {
  onClose: () => void; existing?: any;
}) {
  const qc = useQueryClient();
  const isEdit = !!existing;
  const [form, setForm] = useState<ExperienceDto>({
    poste:       existing?.poste       ?? "",
    entreprise:  existing?.entreprise  ?? "",
    dateDebut:   existing?.dateDebut   ?? "",
    dateFin:     existing?.dateFin     ?? "",
    actuel:      existing?.actuel      ?? false,
    description: existing?.description ?? "",
  });

  const mut = useMutation({
    mutationFn: () => isEdit
      ? candidatsApi.updateExperience(existing.id, form)
      : candidatsApi.addExperience(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["profile"] });
      toast.success(isEdit ? "Modifié" : "Expérience ajoutée");
      onClose();
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <Modal title={isEdit ? "Modifier l'expérience" : "Ajouter une expérience"} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Poste">
          <input style={inputSx} value={form.poste} onChange={e => setForm(f => ({ ...f, poste:e.target.value }))} placeholder="Senior React Developer" required/>
        </Field>
        <Field label="Entreprise">
          <input style={inputSx} value={form.entreprise} onChange={e => setForm(f => ({ ...f, entreprise:e.target.value }))} placeholder="TechCorp SA" required/>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Date de début">
            <input style={inputSx} value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut:e.target.value }))} placeholder="2022" required/>
          </Field>
          <Field label="Date de fin">
            <input style={inputSx} value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin:e.target.value }))} placeholder="2024" disabled={form.actuel}/>
          </Field>
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#5A7A96", marginBottom:14, cursor:"pointer" }}>
          <input type="checkbox" checked={form.actuel} onChange={e => setForm(f => ({ ...f, actuel:e.target.checked, dateFin:"" }))}/>
          Poste actuel
        </label>
        <Field label="Description">
          <textarea style={{ ...inputSx, minHeight:72, resize:"vertical" } as any} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Décrivez vos responsabilités…"/>
        </Field>
        <SubmitBtn loading={mut.isPending} label={isEdit ? "Modifier" : "Ajouter"}/>
      </form>
    </Modal>
  );
}