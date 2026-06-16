"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enUS, fr } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import type { AppLanguage } from "@/hooks/useAppLanguage";
import { candidatsApi, type ExperienceDto } from "@/lib/api";
import "react-datepicker/dist/react-datepicker.css";
import { PROFILE_COPY } from "./copy";
import { Field, inputSx, Modal, SubmitBtn } from "./Modal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ymToDate(ym: string | undefined): Date | null {
  if (!ym) return null;
  const [y, m] = ym.split("-");
  if (!y || !m) return null;
  return new Date(Number(y), Number(m) - 1, 1);
}
function dateToYM(d: Date | null): string {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Custom trigger — styled to match other inputs, fixed width via 100% ─────
const MONTHS: Record<AppLanguage, string[]> = {
  fr: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

function normalizedMonth(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findMonthSuggestion(
  value: string,
  months: string[],
  language: AppLanguage,
) {
  const normalizedValue = normalizedMonth(value);

  if (!normalizedValue) return "";

  if (language === "fr" && normalizedValue === "ma") {
    return "Mai";
  }

  return (
    months.find((month) =>
      normalizedMonth(month).startsWith(normalizedValue),
    ) ?? ""
  );
}

function ymToParts(ym: string | undefined, language: AppLanguage) {
  if (!ym) return { month: "", year: "" };
  const [year, month] = ym.split("-");
  const monthIndex = Number(month) - 1;

  return {
    month: MONTHS[language][monthIndex] ?? "",
    year: year ?? "",
  };
}

function monthYearToYM(month: string, year: string, language: AppLanguage) {
  if (!/^\d{4}$/.test(year)) return "";

  const resolvedMonth =
    MONTHS[language].find(
      (candidate) => normalizedMonth(candidate) === normalizedMonth(month),
    ) ?? findMonthSuggestion(month, MONTHS[language], language);

  const monthIndex = MONTHS[language].indexOf(resolvedMonth);

  if (monthIndex === -1) return "";

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

type MonthYearInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  language: AppLanguage;
  selectedYM?: string;
  onYMChange: (value: string) => void;
};

const MonthYearInput = forwardRef<HTMLInputElement, MonthYearInputProps>(
  ({ disabled, language, selectedYM, onClick, onYMChange, ...props }, ref) => {
    const months = MONTHS[language];
    const parts = useMemo(
      () => ymToParts(selectedYM, language),
      [selectedYM, language],
    );
    const [monthText, setMonthText] = useState(parts.month);
    const [yearText, setYearText] = useState(parts.year);
    const monthSuggestion = findMonthSuggestion(monthText, months, language);
    const monthCompletion =
      monthSuggestion && monthText
        ? monthSuggestion.slice(monthText.length)
        : "";

    useEffect(() => {
      setMonthText(parts.month);
      setYearText(parts.year);
    }, [parts.month, parts.year]);

    const commitValue = (nextMonth: string, nextYear: string) => {
      const nextYM = monthYearToYM(nextMonth, nextYear, language);

      if (nextYM) {
        onYMChange(nextYM);
        return;
      }

      if (!nextMonth && !nextYear) {
        onYMChange("");
      }
    };

    const updateMonth = (value: string) => {
      const lettersOnly = value.replace(/[^a-zA-ZÀ-ÿ]/g, "");
      const matchesMonth = findMonthSuggestion(lettersOnly, months, language);

      if (lettersOnly && !matchesMonth) return;

      setMonthText(lettersOnly);
      commitValue(lettersOnly, yearText);
    };

    const updateYear = (value: string) => {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      setYearText(digitsOnly);
      commitValue(monthText, digitsOnly);
    };

    const openPicker = () => {
      (onClick as unknown as (() => void) | undefined)?.();
    };

    const openPickerFromKey = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        openPicker();
      }
    };

    return (
      <div className="experience-date-input-wrap">
        <div className="experience-date-combo">
          <div className="experience-date-month-shell">
            <span className="experience-date-month-ghost" aria-hidden="true">
              <span className="experience-date-month-ghost-hidden">
                {monthText}
              </span>
              {monthCompletion}
            </span>
            <input
              {...props}
              ref={ref}
              disabled={disabled}
              className="experience-date-month-input"
              placeholder={language === "fr" ? "Mois" : "Month"}
              value={monthText}
              onChange={(event) => updateMonth(event.target.value)}
              onClick={openPicker}
              onKeyDown={openPickerFromKey}
              autoComplete="off"
            />
          </div>
          <span className="experience-date-separator">/</span>
          <input
            disabled={disabled}
            className="experience-date-year-input"
            inputMode="numeric"
            placeholder="YYYY"
            value={yearText}
            onChange={(event) => updateYear(event.target.value)}
            onClick={openPicker}
            onKeyDown={openPickerFromKey}
            autoComplete="off"
            aria-label={language === "fr" ? "Année" : "Year"}
          />
        </div>
        <CalendarDays
          size={16}
          aria-hidden="true"
          className="experience-date-input-icon"
        />
      </div>
    );
  },
);
MonthYearInput.displayName = "MonthYearInput";

const labelSx: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#5A7A96",
  marginBottom: 7,
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export function AddExperienceModal({
  onClose,
  existing,
  language,
}: {
  onClose: () => void;
  existing?: Partial<ExperienceDto> & { id: number };
  language: AppLanguage;
}) {
  const qc = useQueryClient();
  const isEdit = !!existing;
  const copy = PROFILE_COPY[language].expModal;
  const datePickerLocale = language === "fr" ? fr : enUS;

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.dateDebut) {
      toast.error("La date de début est requise.");
      return;
    }
    if (!form.actuel && !form.dateFin) {
      toast.error("La date de fin est requise, ou cochez « poste actuel ».");
      return;
    }
    if (form.dateDebut && form.dateFin && form.dateDebut > form.dateFin) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }
    mut.mutate();
  };

  return (
    <Modal title={isEdit ? copy.editTitle : copy.addTitle} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label={copy.posteLabel}>
          <input
            style={inputSx}
            value={form.poste}
            onChange={(e) => setForm((f) => ({ ...f, poste: e.target.value }))}
            placeholder={copy.postePlaceholder}
            required
          />
        </Field>

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

        {/* Dates side by side */}
        <div className="experience-date-grid">
          <div>
            <label htmlFor="experience-date-debut" style={labelSx}>
              {copy.dateDebutLabel}
            </label>
            <DatePicker
              id="experience-date-debut"
              selected={ymToDate(form.dateDebut)}
              onChange={(d: Date | null) =>
                setForm((f) => ({ ...f, dateDebut: dateToYM(d) }))
              }
              showMonthYearPicker
              showFullMonthYearPicker
              shouldCloseOnSelect
              dateFormat="MM/yyyy"
              locale={datePickerLocale}
              maxDate={new Date()}
              customInput={
                <MonthYearInput
                  aria-label={copy.dateDebutLabel}
                  language={language}
                  selectedYM={form.dateDebut}
                  onYMChange={(value) =>
                    setForm((f) => ({ ...f, dateDebut: value }))
                  }
                />
              }
              wrapperClassName="experience-date-picker"
              calendarClassName="experience-date-calendar"
              popperPlacement="bottom-start"
            />
          </div>

          <div>
            <label htmlFor="experience-date-fin" style={labelSx}>
              {copy.dateFinLabel}
            </label>
            {form.actuel ? (
              <div
                style={{
                  ...(inputSx as CSSProperties),
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#1A9E6F",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#1A9E6F",
                    flexShrink: 0,
                  }}
                />
                {copy.actuelLabel}
              </div>
            ) : (
              <DatePicker
                id="experience-date-fin"
                selected={ymToDate(form.dateFin ?? "")}
                onChange={(d: Date | null) =>
                  setForm((f) => ({ ...f, dateFin: dateToYM(d) }))
                }
                showMonthYearPicker
                showFullMonthYearPicker
                shouldCloseOnSelect
                dateFormat="MM/yyyy"
                locale={datePickerLocale}
                minDate={ymToDate(form.dateDebut) ?? undefined}
                maxDate={new Date()}
                customInput={
                  <MonthYearInput
                    aria-label={copy.dateFinLabel}
                    language={language}
                    selectedYM={form.dateFin}
                    onYMChange={(value) =>
                      setForm((f) => ({ ...f, dateFin: value }))
                    }
                  />
                }
                wrapperClassName="experience-date-picker"
                calendarClassName="experience-date-calendar"
                popperPlacement="bottom-end"
              />
            )}
          </div>
        </div>

        {/* Actuel checkbox */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#5A7A96",
            marginBottom: 14,
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={form.actuel}
            onChange={(e) =>
              setForm((f) => ({ ...f, actuel: e.target.checked, dateFin: "" }))
            }
            style={{
              width: 15,
              height: 15,
              accentColor: "#10406B",
              cursor: "pointer",
            }}
          />
          <span>{copy.actuelLabel}</span>
        </div>

        <Field label={copy.descLabel}>
          <textarea
            style={
              { ...inputSx, minHeight: 72, resize: "vertical" } as CSSProperties
            }
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
