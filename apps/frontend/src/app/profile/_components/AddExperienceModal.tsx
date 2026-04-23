"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type ExperienceDto } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";
import { PROFILE_COPY } from "./copy";
import type { AppLanguage } from "@/hooks/useAppLanguage";

export function AddExperienceModal({
  onClose,
  existing,
  language,
}: {
  onClose: () => void;
  existing?: any;
  language: AppLanguage;
}) {
  const qc = useQueryClient();
  const isEdit = !!existing;
  const copy = PROFILE_COPY[language].expModal;

  const [form, setForm] = useState<ExperienceDto>({
    poste: existing?.poste ?? "",
    entreprise: existing?.entreprise ?? "",
    dateDebut: existing?.dateDebut ?? "",
    dateFin: existing?.dateFin ?? "",
    actuel: existing?.actuel ?? false,
    description: existing?.description ?? "",
  });

  const mut = useMutation({
    mutationFn: () =>
      isEdit
        ? candidatsApi.updateExperience(existing.id, form)
        : candidatsApi.addExperience(form),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(isEdit ? copy.successEdit : copy.successAdd);
      onClose();
    },

    onError: () => toast.error(copy.errorMsg),
  });

  const isInvalidDate =
    form.dateDebut &&
    form.dateFin &&
    form.dateDebut > form.dateFin;

  return (
    <Modal
      title={isEdit ? copy.editTitle : copy.addTitle}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (isInvalidDate) {
            toast.error("Invalid date range");
            return;
          }

          mut.mutate();
        }}
      >
        {/* Poste */}
        <Field label={copy.posteLabel}>
          <input
            style={inputSx}
            value={form.poste}
            onChange={(e) =>
              setForm((f) => ({ ...f, poste: e.target.value }))
            }
            placeholder={copy.postePlaceholder}
            required
          />
        </Field>

        {/* Entreprise */}
        <Field label={copy.entrepriseLabel}>
          <input
            style={inputSx}
            value={form.entreprise}
            onChange={(e) =>
              setForm((f) => ({ ...f, entreprise: e.target.value }))
            }
            placeholder={copy.entreprisePlaceholder}
            required
          />
        </Field>

        {/* Dates */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Field label={copy.dateDebutLabel}>
            <input
              type="month"
              style={inputSx}
              value={form.dateDebut}
              onChange={(e) =>
                setForm((f) => ({ ...f, dateDebut: e.target.value }))
              }
              required
            />
          </Field>

          <Field label={copy.dateFinLabel}>
            <input
              type="month"
              style={inputSx}
              value={form.dateFin}
              onChange={(e) =>
                setForm((f) => ({ ...f, dateFin: e.target.value }))
              }
              disabled={form.actuel}
            />
          </Field>
        </div>

        {/* Actuel */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#5A7A96",
            marginBottom: 14,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.actuel}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                actuel: e.target.checked,
                dateFin: "",
              }))
            }
          />
          {copy.actuelLabel}
        </label>

        {/* Description */}
        <Field label={copy.descLabel}>
          <textarea
            style={{ ...inputSx, minHeight: 72, resize: "vertical" } as any}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder={copy.descPlaceholder}
          />
        </Field>

        <SubmitBtn
          loading={mut.isPending}
          label={isEdit ? copy.editBtn : copy.addBtn}
        />
      </form>
    </Modal>
  );
}