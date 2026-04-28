// frontend/src/app/profile/_components/EditProfileModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatsApi, type CandidatProfile } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal, Field, inputSx, SubmitBtn } from "./Modal";
import { LocationInput } from "@/components/ui/LocationInput";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { PROFILE_COPY } from "./copy";
import type { AppLanguage } from "@/hooks/useAppLanguage";

export function EditProfileModal({
  profile,
  onClose,
  language,
}: {
  profile: CandidatProfile;
  onClose: () => void;
  language: AppLanguage;
}) {
  const qc = useQueryClient();
  const copy = PROFILE_COPY[language].editProfileModal;

  const [form, setForm] = useState({
    prenom: profile.prenom ?? "",
    nom: profile.nom ?? "",
    titre: profile.titre ?? "",
    bio: profile.bio ?? "",
    telephone: profile.telephone ?? "",
    localisation: profile.localisation ?? "",
  });

  const mut = useMutation({
    mutationFn: () => candidatsApi.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(copy.success);
      onClose();
    },
    onError: () => toast.error(copy.error),
  });

  return (
    <Modal title={copy.title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (!form.telephone) {
            toast.error(copy.phone);
            return;
          }

          mut.mutate();
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Field label={copy.firstName}>
            <input
              style={inputSx}
              value={form.prenom}
              onChange={(e) =>
                setForm((f) => ({ ...f, prenom: e.target.value }))
              }
              required
            />
          </Field>

          <Field label={copy.lastName}>
            <input
              style={inputSx}
              value={form.nom}
              onChange={(e) =>
                setForm((f) => ({ ...f, nom: e.target.value }))
              }
              required
            />
          </Field>
        </div>

        <Field label={copy.titleLabel}>
          <input
            style={inputSx}
            value={form.titre}
            onChange={(e) =>
              setForm((f) => ({ ...f, titre: e.target.value }))
            }
            placeholder="Senior React Developer"
          />
        </Field>

        <Field label={copy.bio}>
          <textarea
            style={{ ...inputSx, minHeight: 80 }}
            value={form.bio}
            onChange={(e) =>
              setForm((f) => ({ ...f, bio: e.target.value }))
            }
          />
        </Field>

        <Field label={copy.phone}>
          <PhoneInput
            international
            defaultCountry="MA"
            value={form.telephone}
            onChange={(value) =>
              setForm((f) => ({ ...f, telephone: value || "" }))
            }
            style={inputSx}
          />
        </Field>

        <Field label={copy.location}>
          <LocationInput
            style={inputSx}
            value={form.localisation}
            onChange={(v) =>
              setForm((f) => ({ ...f, localisation: v }))
            }
          />
        </Field>

        <SubmitBtn
          loading={mut.isPending}
          label={copy.save}
        />
      </form>
    </Modal>
  );
}