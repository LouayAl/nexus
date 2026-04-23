"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type FormationDto } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";
import { PROFILE_COPY } from "./copy";
import type { AppLanguage } from "@/hooks/useAppLanguage";

export function AddFormationModal({
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
  const copy = PROFILE_COPY[language].formModal;

  const parseYears = (v?: string) => {
    if (!v) return ["", ""];
    const [start, end] = v.split("-");
    return [start ?? "", end ?? ""];
  };

  const [startYear, endYear] = parseYears(existing?.annee);

  const [form, setForm] = useState<FormationDto>({
    diplome: existing?.diplome ?? "",
    ecole: existing?.ecole ?? "",
    annee: existing?.annee ?? "",
  });

  const [years, setYears] = useState({
    start: startYear,
    end: endYear,
  });

  const mut = useMutation({
    mutationFn: () => {
      if (years.start && years.end && years.start > years.end) {
        throw new Error("INVALID_YEAR_RANGE");
      }

      return isEdit
        ? candidatsApi.updateFormation(existing.id, {
            ...form,
            annee: `${years.start}-${years.end}`,
          })
        : candidatsApi.addFormation({
            ...form,
            annee: `${years.start}-${years.end}`,
          });
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(isEdit ? copy.successEdit : copy.successAdd);
      onClose();
    },

    onError: (err: any) => {
      if (err?.message === "INVALID_YEAR_RANGE") {
        toast.error(copy.errorMsg);
        return;
      }
      toast.error(copy.errorMsg);
    },
  });

  return (
    <Modal
      title={isEdit ? copy.editTitle : copy.addTitle}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <Field label={copy.diplomeLabel}>
          <input
            style={inputSx}
            value={form.diplome}
            onChange={(e) =>
              setForm((f) => ({ ...f, diplome: e.target.value }))
            }
            placeholder={copy.diplomePlaceholder}
            required
          />
        </Field>

        <Field label={copy.ecoleLabel}>
          <input
            style={inputSx}
            value={form.ecole}
            onChange={(e) =>
              setForm((f) => ({ ...f, ecole: e.target.value }))
            }
            placeholder={copy.ecolePlaceholder}
            required
          />
        </Field>

        <Field label={copy.anneeLabel}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <select
              style={inputSx}
              value={years.start}
              onChange={(e) =>
                setYears((v) => ({ ...v, start: e.target.value }))
              }
              required
            >
              <option value="">
                {language === "fr" ? "Début" : "Start"}
              </option>

              {Array.from({ length: 60 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>

            <select
              style={inputSx}
              value={years.end}
              onChange={(e) =>
                setYears((v) => ({ ...v, end: e.target.value }))
              }
              required
            >
              <option value="">
                {language === "fr" ? "Fin" : "End"}
              </option>

              {Array.from({ length: 60 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </Field>

        <SubmitBtn
          loading={mut.isPending}
          label={isEdit ? copy.editBtn : copy.addBtn}
        />
      </form>
    </Modal>
  );
}