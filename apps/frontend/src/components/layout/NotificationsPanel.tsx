"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { theme } from "@/lib/theme";
import { Card } from "@/components/ui";
import type { Notification } from "@/lib/api";

// Static mock until backend is ready
const MOCK_NOTIFS: Notification[] = [
  { id:1, message:"Votre candidature chez TechNova a été retenue pour un entretien", date: new Date().toISOString(), lue: false },
  { id:2, message:"DataVision a consulté votre profil",                              date: new Date().toISOString(), lue: false },
  { id:3, message:"Rappel : entretien avec PixelForge demain à 14h",                 date: new Date().toISOString(), lue: true  },
  { id:4, message:"Nouvelle offre correspondant à votre profil : DevOps chez CloudBase", date: new Date().toISOString(), lue: true },
];

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>(MOCK_NOTIFS);

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, lue: true })));
  const markOne = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, lue: true } : x));

  return (
    <aside
      className="animate-slide-in"
      style={{
        width: 340, flexShrink: 0, overflowY: "auto", padding: 22,
        borderLeft: `1px solid ${theme.cardBorder}`,
        background: theme.bgSurface,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="font-syne" style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>Notifications</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={markAll} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textSub, fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            Tout lire
          </button>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", color: theme.textSub, borderRadius: 6, padding: "4px 6px", display: "flex" }}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map((n) => (
          <Card
            key={n.id}
            style={{ padding: "14px 16px", opacity: n.lue ? 0.55 : 1, position: "relative", cursor: "pointer", transition: "opacity 0.3s" }}
            onClick={() => !n.lue && markOne(n.id)}
          >
            {!n.lue && (
              <div style={{ position: "absolute", top: 12, right: 12, width: 7, height: 7, borderRadius: "50%", background: theme.primary, boxShadow: `0 0 6px ${theme.primary}` }} />
            )}
            <div style={{ color: theme.text, fontSize: 13, lineHeight: 1.55, marginBottom: 6 }}>{n.message}</div>
            <div style={{ color: theme.textFaint, fontSize: 11 }}>
              {new Date(n.date).toLocaleDateString("fr-FR")}
            </div>
          </Card>
        ))}
      </div>
    </aside>
  );
}