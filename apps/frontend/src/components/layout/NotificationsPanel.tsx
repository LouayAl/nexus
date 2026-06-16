"use client";

import { X, Bell, CheckCheck, Briefcase, FileText, ChevronRight, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notificationsApi, type Notification } from "@/lib/api";

// ─── Routing logic ────────────────────────────────────────────────────────────
// Notifications carry an optional `metadata` JSON field set by the backend.
// Shape: { type: "offre" | "candidature", offreId?: number, candidatureId?: number }
// Falls back to heuristic title-matching for legacy notifications.



function resolveRoute(n: Notification, userRole: "CANDIDAT" | "ENTREPRISE" | "ADMIN"): string | null {
  const meta = n.metadata ?? {};

  // ── Metadata-based routing (new notifications) ──
  if (meta.type === 'candidature' && meta.candidatureId) {
    if (userRole === 'CANDIDAT')   return '/applications';
    if (userRole === 'ENTREPRISE') return '/company/dashboard';
  }
  if (meta.type === 'offre' && meta.offreId) {
    if (userRole === 'CANDIDAT')   return '/discover';
    if (userRole === 'ENTREPRISE') return '/company/dashboard';
    if (userRole === 'ADMIN')      return '/admin/offres';
  }

  // ── Heuristic fallback (legacy notifications without metadata) ──
  const titre = n.titre?.toLowerCase() ?? '';
  const msg   = n.message?.toLowerCase() ?? '';

  if (titre.includes('candidature') || msg.includes('candidature')) {
    if (userRole === 'CANDIDAT')   return '/applications';
    if (userRole === 'ENTREPRISE') return '/company/dashboard';
  }
  if (titre.includes('offre') || msg.includes('offre')) {
    if (userRole === 'CANDIDAT')   return '/discover';
    if (userRole === 'ENTREPRISE') return '/company/dashboard';
    if (userRole === 'ADMIN')      return '/admin/offres';
  }

  return null;
}

function getNotifIcon(n: Notification) {
  const titre = n.titre?.toLowerCase() ?? "";
  if (titre.includes("candidature")) return FileText;
  if (titre.includes("offre"))       return Briefcase;
  return Info;
}

function getNotifAccent(n: Notification): { bg: string; border: string; icon: string } {
  const titre = n.titre?.toLowerCase() ?? "";
  if (titre.includes("candidature")) {
    return { bg: "rgba(238,129,61,0.07)", border: "rgba(238,129,61,0.25)", icon: "#EE813D" };
  }
  if (titre.includes("offre")) {
    return { bg: "rgba(34,132,192,0.07)", border: "rgba(34,132,192,0.2)", icon: "#2284C0" };
  }
  return { bg: "rgba(16,64,107,0.04)", border: "rgba(16,64,107,0.1)", icon: "#5A7A96" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7)   return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  userRole: "CANDIDAT" | "ENTREPRISE" | "ADMIN";
}

export function NotificationsPanel({ onClose, userRole }: Props) {
  const qc     = useQueryClient();
  const router = useRouter();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey:        ["notifications"],
    queryFn:         () => notificationsApi.getAll().then(r => r.data),
    refetchInterval: 30_000,
  });

  const markOne = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAll(),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifs.filter((n: Notification) => !n.lu).length;

  const handleClick = (n: Notification) => {
    if (!n.lu) markOne.mutate(n.id);
    const route = resolveRoute(n, userRole);
    if (route) {
      onClose();
      router.push(route);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(13,33,55,0.18)",
          backdropFilter: "blur(2px)",
          zIndex: 199,
        }}
      />

      {/* Panel */}
      <div style={{
        position:      "fixed",
        top:           0,
        right:         0,
        bottom:        0,
        width:         380,
        zIndex:        200,
        display:       "flex",
        flexDirection: "column",
        background:    "#F8FAFC",
        boxShadow:     "-12px 0 48px rgba(16,64,107,0.14)",
      }}>

        {/* ── Top gradient bar ── */}
        <div style={{
          background:    "linear-gradient(135deg, #10406b 0%, #2284c0 100%)",
          padding:       "20px 20px 24px",
          flexShrink:    0,
          position:      "relative",
          overflow:      "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -30, left: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Bell size={16} color="rgba(255,255,255,0.85)" />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}>
                  Notifications
                </span>
                {unread > 0 && (
                  <span style={{
                    background:   "#EE813D",
                    color:        "white",
                    fontSize:     11,
                    fontWeight:   700,
                    padding:      "2px 8px",
                    borderRadius: 99,
                    lineHeight:   "16px",
                  }}>
                    {unread}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif" }}>
                {unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {unread > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          4,
                    background:   "rgba(255,255,255,0.12)",
                    border:       "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    cursor:       "pointer",
                    color:        "rgba(255,255,255,0.9)",
                    fontSize:     12,
                    fontWeight:   600,
                    padding:      "6px 10px",
                    fontFamily:   "'DM Sans', sans-serif",
                  }}
                >
                  <CheckCheck size={12} /> Tout lire
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  width:        32,
                  height:       32,
                  borderRadius: 8,
                  background:   "rgba(255,255,255,0.12)",
                  border:       "1px solid rgba(255,255,255,0.2)",
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} color="rgba(255,255,255,0.85)" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Notif list ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 88, borderRadius: 14, background: "rgba(16,64,107,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
              <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
            </div>
          ) : notifs.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(16,64,107,0.08) 0%, rgba(34,132,192,0.08) 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Bell size={26} color="#B0C4D4" />
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#0D2137", fontFamily: "'Outfit', sans-serif" }}>
                Aucune notification
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#8FA8BE", fontFamily: "'DM Sans', sans-serif" }}>
                Vous serez notifié ici des mises à jour importantes.
              </p>
            </div>
          ) : (
            notifs.map((n: Notification) => {
              const accent   = getNotifAccent(n);
              const Icon     = getNotifIcon(n);
              const route    = resolveRoute(n, userRole);
              const isAction = !!route;

              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding:      "14px 14px",
                    borderRadius: 14,
                    border:       `1px solid ${n.lu ? "rgba(16,64,107,0.08)" : accent.border}`,
                    background:   n.lu ? "#fff" : accent.bg,
                    cursor:       isAction ? "pointer" : (n.lu ? "default" : "pointer"),
                    display:      "flex",
                    gap:          12,
                    alignItems:   "flex-start",
                    transition:   "box-shadow 0.15s, transform 0.12s",
                    boxShadow:    n.lu ? "0 1px 4px rgba(16,64,107,0.04)" : "0 2px 8px rgba(16,64,107,0.08)",
                    position:     "relative",
                  }}
                  onMouseEnter={e => {
                    if (isAction) {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(16,64,107,0.14)";
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = n.lu ? "0 1px 4px rgba(16,64,107,0.04)" : "0 2px 8px rgba(16,64,107,0.08)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Icon badge */}
                  <div style={{
                    width:          36,
                    height:         36,
                    borderRadius:   10,
                    flexShrink:     0,
                    background:     n.lu ? "rgba(16,64,107,0.06)" : `${accent.icon}18`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    marginTop:      1,
                  }}>
                    <Icon size={16} color={n.lu ? "#8FA8BE" : accent.icon} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, gap: 6 }}>
                      <span style={{
                        fontSize:    12,
                        fontWeight:  700,
                        color:       n.lu ? "#5A7A96" : "#0D2137",
                        fontFamily:  "'Outfit', sans-serif",
                        whiteSpace:  "nowrap",
                        overflow:    "hidden",
                        textOverflow:"ellipsis",
                      }}>
                        {n.titre}
                      </span>
                      {/* Unread dot */}
                      {!n.lu && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent.icon, flexShrink: 0 }} />
                      )}
                    </div>

                    <p style={{
                      margin:     "0 0 8px",
                      fontSize:   12.5,
                      color:      n.lu ? "#8FA8BE" : "#334E68",
                      lineHeight: 1.55,
                      fontFamily: "'DM Sans', sans-serif",
                      display:    "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow:   "hidden",
                    }}>
                      {n.message}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#B0C4D4", fontFamily: "'DM Sans', sans-serif" }}>
                        {timeAgo(n.createdAt)}
                      </span>
                      {isAction && (
                        <span style={{
                          display:    "flex",
                          alignItems: "center",
                          gap:        2,
                          fontSize:   11,
                          fontWeight: 600,
                          color:      n.lu ? "#8FA8BE" : accent.icon,
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          Voir <ChevronRight size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding:       "12px 16px",
          borderTop:     "1px solid rgba(16,64,107,0.07)",
          background:    "#fff",
          flexShrink:    0,
          textAlign:     "center",
        }}>
          <span style={{ fontSize: 11, color: "#B0C4D4", fontFamily: "'DM Sans', sans-serif" }}>
            {notifs.length > 0 ? `${notifs.length} notification${notifs.length > 1 ? "s" : ""} au total` : "Aucune notification"}
          </span>
        </div>
      </div>
    </>
  );
}