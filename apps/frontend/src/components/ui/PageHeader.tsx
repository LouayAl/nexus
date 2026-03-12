import { theme } from "@/lib/theme";

export function PageHeader({ title, subtitle, live, liveLabel, action }: {
  title:      React.ReactNode;
  subtitle?:  string;
  live?:      boolean;
  liveLabel?: string;
  action?:    React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 className="font-syne" style={{ fontSize: 28, fontWeight: 800, color: theme.text, marginBottom: 5 }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: theme.textSub }}>
            {live && (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.success, display: "inline-block", boxShadow: `0 0 8px ${theme.success}` }} />
            )}
            {subtitle}
            {live && liveLabel && <span style={{ color: theme.textFaint }}>· {liveLabel}</span>}
          </div>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}