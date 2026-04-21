// frontend/src/app/admin/components/ChipSelector.tsx
"use client";

interface ChipOption {
  label: string;
  color: string;
}

interface ChipSelectorProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function ChipSelector({ options, value, onChange, allowEmpty, emptyLabel = "— Sélectionner —" }: ChipSelectorProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {allowEmpty && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{
            padding: "7px 14px", borderRadius: 20,
            border: `2px solid ${value === "" ? "#5A7A96" : "rgba(16,64,107,0.1)"}`,
            background: value === "" ? "rgba(90,122,150,0.1)" : "#FAFAF8",
            color: value === "" ? "#5A7A96" : "#9BAFC0",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.15s",
          }}
        >
          {emptyLabel}
        </button>
      )}
      {options.map(({ label, color }) => {
        const selected = value === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            style={{
              padding: "7px 14px", borderRadius: 20,
              border: `2px solid ${selected ? color : "rgba(16,64,107,0.1)"}`,
              background: selected ? `${color}18` : "#FAFAF8",
              color: selected ? color : "#5A7A96",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              if (!selected) {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
                e.currentTarget.style.background = `${color}0A`;
              }
            }}
            onMouseLeave={e => {
              if (!selected) {
                e.currentTarget.style.borderColor = "rgba(16,64,107,0.1)";
                e.currentTarget.style.color = "#5A7A96";
                e.currentTarget.style.background = "#FAFAF8";
              }
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}