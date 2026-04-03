// ═══════════════════════════════════════════════════════════════════════════════
// FIELD HELPER
// ═══════════════════════════════════════════════════════════════════════════════

interface FieldProps {
  label: string;
  children: React.ReactNode;
  half?: boolean;
}

export function Field({ label, children, half }: FieldProps) {
  return (
    <div style={{ marginBottom: 16, ...(half ? { flex: 1 } : {}) }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(16,64,107,0.12)", outline: "none", fontSize: 13, color: "#0D2137", fontFamily: "'DM Sans',sans-serif", background: "#FAFAF8", boxSizing: "border-box", transition: "border-color 0.15s",
};