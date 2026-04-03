// ═══════════════════════════════════════════════════════════════════════════════
// CHART TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.1)", borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 20px rgba(16,64,107,0.1)", fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: "#5A7A96", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</div>)}
    </div>
  );
}