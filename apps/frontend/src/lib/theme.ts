export const theme = {
  // ── Backgrounds ──────────────────────────────────────────────────
  bg:              "#F0F4F8",
  bgSurface:       "#FFFFFF",
  card:            "rgba(255,255,255,0.95)",
  cardBorder:      "rgba(16,64,107,0.08)",
  cardBorderHover: "rgba(34,132,192,0.4)",

  // ── Brand colors ─────────────────────────────────────────────────
  primary:         "#2284C0",          // blue — CTAs, active states
  primaryDim:      "rgba(34,132,192,0.1)",
  secondary:       "#10406B",          // dark blue — headings, depth
  secondaryDim:    "rgba(16,64,107,0.1)",
  accent:          "#EE813D",          // orange — highlights, badges
  accentDim:       "rgba(238,129,61,0.12)",

  // ── Semantic ──────────────────────────────────────────────────────
  success:         "#1A9E6F",
  successDim:      "rgba(26,158,111,0.1)",
  warning:         "#EE813D",          // orange doubles as warning
  warningDim:      "rgba(238,129,61,0.12)",
  danger:          "#D64045",
  dangerDim:       "rgba(214,64,69,0.1)",

  // ── Text ──────────────────────────────────────────────────────────
  text:            "#0D2137",          // near-black navy
  textSub:         "#5A7A96",
  textFaint:       "#B0C4D4",
} as const;

export const STATUS_CONFIG = {
  EN_ATTENTE: { color: theme.accent,    bg: theme.accentDim,    label: "En attente" },
  ENTRETIEN:  { color: theme.primary,   bg: theme.primaryDim,   label: "Entretien"  },
  "ACCEPTÉ":  { color: theme.success,   bg: theme.successDim,   label: "Accepté"    },
  "REFUSÉ":   { color: theme.danger,    bg: theme.dangerDim,    label: "Refusé"     },
  OUVERTE:    { color: theme.success,   bg: theme.successDim,   label: "Ouverte"    },
  "FERMÉE":   { color: theme.textSub,   bg: "rgba(90,122,150,0.1)", label: "Fermée" },
} as const;

export type AppStatus = keyof typeof STATUS_CONFIG;

export const CONTRACT_COLORS: Record<string, string> = {
  CDI:       "success",
  CDD:       "warning",
  Freelance: "secondary",
  Stage:     "primary",
  Alternance:"accent",
};