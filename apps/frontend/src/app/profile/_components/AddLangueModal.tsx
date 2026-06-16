// frontend/src/app/profile/_components/AddLangueModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";
import { NIVEAU_OPTIONS, LANGUE_NIVEAU_COLORS } from "./types";
import { PROFILE_COPY } from "./copy";
import type { AppLanguage } from "@/hooks/useAppLanguage";

export function AddLangueModal({
  onClose,
  existing,
  language,
}: {
  onClose: () => void;
  existing?: any;
  language: AppLanguage;
}) {
  const qc     = useQueryClient();
  const copy   = PROFILE_COPY[language].langueModal;
  const isEdit = !!existing;

  const [nom,    setNom]    = useState(existing?.nom    ?? "");
  const [niveau, setNiveau] = useState(existing?.niveau ?? "Intermédiaire");

  const mut = useMutation({
    mutationFn: () =>
      isEdit
        ? candidatsApi.updateLangue(existing.id, { nom, niveau })
        : candidatsApi.addLangue({ nom, niveau }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(isEdit ? copy.successEdit : copy.successAdd);
      onClose();
    },
    onError: () => toast.error(copy.errorMsg),
  });

  return (
    <Modal title={isEdit ? copy.editTitle : copy.addTitle} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
        <Field label={copy.langLabel}>
          <input
            style={inputSx}
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder={copy.langPlaceholder}
            required
          />
        </Field>

        <Field label={copy.niveauLabel}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {NIVEAU_OPTIONS.slice(0, -1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNiveau(n)}
                style={{
                  padding: "9px 12px", borderRadius: 10,
                  border: `2px solid ${niveau === n ? LANGUE_NIVEAU_COLORS[n] : "rgba(16,64,107,0.1)"}`,
                  background: niveau === n ? `${LANGUE_NIVEAU_COLORS[n]}12` : "#FAFAF8",
                  color: niveau === n ? LANGUE_NIVEAU_COLORS[n] : "#5A7A96",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            {(() => {
              const n = NIVEAU_OPTIONS[NIVEAU_OPTIONS.length - 1];
              return (
                <button
                  type="button"
                  onClick={() => setNiveau(n)}
                  style={{
                    padding: "9px 12px", borderRadius: 10, width: "100%",
                    border: `2px solid ${niveau === n ? LANGUE_NIVEAU_COLORS[n] : "rgba(16,64,107,0.1)"}`,
                    background: niveau === n ? `${LANGUE_NIVEAU_COLORS[n]}12` : "#FAFAF8",
                    color: niveau === n ? LANGUE_NIVEAU_COLORS[n] : "#5A7A96",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {n}
                </button>
              );
            })()}
          </div>
        </Field>

        <SubmitBtn loading={mut.isPending} label={isEdit ? copy.editBtn : copy.addBtn} />
      </form>
    </Modal>
  );
}