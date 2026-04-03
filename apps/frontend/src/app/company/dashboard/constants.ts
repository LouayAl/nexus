// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
import { Offre as OffreType, Candidature as CandidatureType } from "@/lib/api";
import { CreateOffreDto as CreateOffreDtoType } from "@/lib/api";

export type Offre = OffreType;
export type Candidature = CandidatureType;
export type CreateOffreDto = CreateOffreDtoType;

// Keep this - it's already defined in your lib/api
// export type CreateOffreDto = CreateOffreDto; 

export const CONTRACT_COLORS: Record<string, { bg: string; color: string }> = {
  CDI:       { bg: "rgba(26,158,111,0.1)",  color: "#1A9E6F" },
  CDD:       { bg: "rgba(238,129,61,0.12)", color: "#EE813D" },
  Freelance: { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED" },
  Stage:     { bg: "rgba(34,132,192,0.1)",  color: "#2284C0" },
  Alternance:{ bg: "rgba(16,64,107,0.1)",   color: "#10406B" },
};

export const STATUT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "rgba(176,196,212,0.15)", color: "#5A7A96" },
  VUE:        { label: "Vue",        bg: "rgba(34,132,192,0.1)",   color: "#2284C0" },
  ENTRETIEN:  { label: "Entretien",  bg: "rgba(124,58,237,0.1)",   color: "#7C3AED" },
  ACCEPTE:    { label: "Accepté",    bg: "rgba(26,158,111,0.1)",   color: "#1A9E6F" },
  REFUSE:     { label: "Refusé",    bg: "rgba(214,64,69,0.1)",    color: "#D64045" },
};

export const OFFRE_STATUT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  OUVERTE:    { label: "Ouverte",    bg: "rgba(26,158,111,0.1)",   color: "#1A9E6F" },
  EN_ATTENTE: { label: "En attente", bg: "rgba(238,129,61,0.1)",   color: "#EE813D" },
  FERMEE:     { label: "Fermée",     bg: "rgba(214,64,69,0.1)",   color: "#D64045" },
};

export const NEXT_STATUT: Record<string, string> = {
  EN_ATTENTE: "VUE",
  VUE:        "ENTRETIEN",
  ENTRETIEN:  "ACCEPTE",
  ACCEPTE:    "ACCEPTE",
  REFUSE:     "REFUSE",
};

export function getEmoji(offre: OffreType): string {
  const skills = offre.competences?.map(c => c.competence.nom) ?? [];
  if (skills.some(s => s.toLowerCase().includes("react")))      return "⚛️";
  if (skills.some(s => s.toLowerCase().includes("python")))     return "🐍";
  if (skills.some(s => s.toLowerCase().includes("figma")))      return "🎨";
  if (skills.some(s => s.toLowerCase().includes("kubernetes"))) return "☁️";
  if (skills.some(s => s.toLowerCase().includes("java")))       return "☕";
  if (skills.some(s => s.toLowerCase().includes("pentest")))    return "🔒";
  if (skills.some(s => s.toLowerCase().includes("node")))       return "🟢";
  if (skills.some(s => s.toLowerCase().includes("typescript"))) return "📘";
  return "💼";
}