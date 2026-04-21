// frontend/src/app/profile/_components/EditProfileModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type CandidatProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";
import { LocationInput } from "@/components/ui/LocationInput";

export function EditProfileModal({
  profile, onClose,
}: {
  profile: CandidatProfile; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    prenom:       profile.prenom       ?? "",
    nom:          profile.nom          ?? "",
    titre:        profile.titre        ?? "",
    bio:          profile.bio          ?? "",
    telephone:    profile.telephone    ?? "",
    localisation: profile.localisation ?? "",
  });

  const mut = useMutation({
    mutationFn: () => candidatsApi.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["profile"] });
      toast.success("Profil mis à jour");
      onClose();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  return (
    <Modal title="Modifier le profil" onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Prénom">
            <input style={inputSx} value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom:e.target.value }))} required/>
          </Field>
          <Field label="Nom">
            <input style={inputSx} value={form.nom} onChange={e => setForm(f => ({ ...f, nom:e.target.value }))} required/>
          </Field>
        </div>
        <Field label="Titre professionnel">
          <input style={inputSx} value={form.titre} onChange={e => setForm(f => ({ ...f, titre:e.target.value }))} placeholder="Ex: Senior React Developer"/>
        </Field>
        <Field label="Bio">
          <textarea style={{ ...inputSx, minHeight:80, resize:"vertical" } as any} value={form.bio} onChange={e => setForm(f => ({ ...f, bio:e.target.value }))} placeholder="Présentez-vous en quelques mots…"/>
        </Field>
        <Field label="Téléphone">
          <input style={inputSx} value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone:e.target.value }))} placeholder="+212 6XX XXX XXX"/>
        </Field>
        <Field label="Localisation">
          <LocationInput
            style={inputSx}
            value={form.localisation}
            onChange={v => setForm(f => ({ ...f, localisation: v }))}
          />
        </Field>
        <SubmitBtn loading={mut.isPending}/>
      </form>
    </Modal>
  );
}