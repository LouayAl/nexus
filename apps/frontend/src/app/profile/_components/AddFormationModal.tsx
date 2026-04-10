// frontend/src/app/profile/_components/AddFormationModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type FormationDto } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";

export function AddFormationModal({
  onClose, existing,
}: {
  onClose: () => void; existing?: any;
}) {
  const qc = useQueryClient();
  const isEdit = !!existing;
  const [form, setForm] = useState<FormationDto>({
    diplome: existing?.diplome ?? "",
    ecole:   existing?.ecole   ?? "",
    annee:   existing?.annee   ?? "",
  });

  const mut = useMutation({
    mutationFn: () => isEdit
      ? candidatsApi.updateFormation(existing.id, form)
      : candidatsApi.addFormation(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["profile"] });
      toast.success(isEdit ? "Modifié" : "Formation ajoutée");
      onClose();
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <Modal title={isEdit ? "Modifier la formation" : "Ajouter une formation"} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Diplôme">
          <input style={inputSx} value={form.diplome} onChange={e => setForm(f => ({ ...f, diplome:e.target.value }))} placeholder="Master Informatique" required/>
        </Field>
        <Field label="École / Université">
          <input style={inputSx} value={form.ecole} onChange={e => setForm(f => ({ ...f, ecole:e.target.value }))} placeholder="Université Paris-Saclay" required/>
        </Field>
        <Field label="Année d'obtention">
          <input style={inputSx} value={form.annee} onChange={e => setForm(f => ({ ...f, annee:e.target.value }))} placeholder="2022" required/>
        </Field>
        <SubmitBtn loading={mut.isPending} label={isEdit ? "Modifier" : "Ajouter"}/>
      </form>
    </Modal>
  );
}