// frontend/src/app/profile/_components/AddLangueModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";
import { NIVEAU_OPTIONS, LANGUE_NIVEAU_COLORS } from "./types";

export function AddLangueModal({
  onClose, existing,
}: {
  onClose: () => void; existing?: any;
}) {
  const qc = useQueryClient();
  const isEdit = !!existing;
  const [nom,    setNom]    = useState(existing?.nom    ?? "");
  const [niveau, setNiveau] = useState(existing?.niveau ?? "Intermédiaire");

  const mut = useMutation({
    mutationFn: () => isEdit
      ? candidatsApi.updateLangue(existing.id, { nom, niveau })
      : candidatsApi.addLangue({ nom, niveau }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["profile"] });
      toast.success(isEdit ? "Modifié" : "Langue ajoutée");
      onClose();
    },
    onError: () => toast.error("Erreur"),
  });

  return (
    <Modal title={isEdit ? "Modifier la langue" : "Ajouter une langue"} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label="Langue">
          <input style={inputSx} value={nom} onChange={e => setNom(e.target.value)} placeholder="Français, Anglais, Arabe…" required/>
        </Field>
        <Field label="Niveau">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {NIVEAU_OPTIONS.slice(0, -1).map(n => (
              <button key={n} type="button" onClick={() => setNiveau(n)} style={{
                padding:"9px 12px", borderRadius:10,
                border:`2px solid ${niveau === n ? LANGUE_NIVEAU_COLORS[n] : "rgba(16,64,107,0.1)"}`,
                background: niveau === n ? `${LANGUE_NIVEAU_COLORS[n]}12` : "#FAFAF8",
                color: niveau === n ? LANGUE_NIVEAU_COLORS[n] : "#5A7A96",
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              }}>{n}</button>
            ))}
          </div>

          {/* Last item centered */}
          <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>
            {(() => { const n = NIVEAU_OPTIONS[NIVEAU_OPTIONS.length - 1]; return (
              <button type="button" onClick={() => setNiveau(n)} style={{
                padding:"9px 12px", borderRadius:10, width:"100%",
                border:`2px solid ${niveau === n ? LANGUE_NIVEAU_COLORS[n] : "rgba(16,64,107,0.1)"}`,
                background: niveau === n ? `${LANGUE_NIVEAU_COLORS[n]}12` : "#FAFAF8",
                color: niveau === n ? LANGUE_NIVEAU_COLORS[n] : "#5A7A96",
                fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              }}>{n}</button>
            );})()}
          </div>
        </Field>
        <SubmitBtn loading={mut.isPending} label={isEdit ? "Modifier" : "Ajouter"}/>
      </form>
    </Modal>
  );
}