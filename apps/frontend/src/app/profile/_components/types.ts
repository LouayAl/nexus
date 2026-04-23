// frontend/src/app/profile/_components/types.ts
import type { CandidatProfile } from "@/lib/api";

export const SKILL_COLORS = ["#2284C0","#10406B","#1A9E6F","#EE813D","#7C3AED","#D64045"];
export const NIVEAU_OPTIONS = ["Débutant","Intermédiaire","Avancé","Bilingue","Natif"];
export const LANGUE_NIVEAU_COLORS: Record<string, string> = {
  "Débutant":"#B0C4D4", "Intermédiaire":"#2284C0", "Avancé":"#1A9E6F","Bilingue":"#7C3AED", "Natif":"#10406B", 
};

export function initials(p: CandidatProfile) {
  return `${p.prenom?.[0] ?? ""}${p.nom?.[0] ?? ""}`.toUpperCase();
}

export function completionPct(p: CandidatProfile) {
  let score = 0;
  if (p.prenom && p.nom)             score += 20;
  if (p.titre)                       score += 15;
  if (p.bio)                         score += 15;
  if (p.telephone)                   score += 10;
  if (p.localisation)                score += 10;
  if (p.cvUrl)                       score += 10;
  if ((p.competences?.length ?? 0) > 0) score += 10;
  if ((p.experiences?.length ?? 0) > 0) score += 5;
  if ((p.formations?.length  ?? 0) > 0) score += 5;
  return score;
}

export function skillLevelLabel(niveau: number) {
  if (niveau <= 40) return "Débutant";
  if (niveau <= 70) return "Intermédiaire";
  return "Expert";
}

export type ModalType =
  | null
  | "editProfile"
  | "addSkill"
  | "addExp"
  | "addForm"
  | "addLang"
  | "changePw";

  export function skillColor(niveau: number): string {
  if (niveau >= 85) return "#1A9E6F"; // Expert        — green
  if (niveau >= 65) return "#2284C0"; // Avancé        — blue
  if (niveau >= 40) return "#EE813D"; // Intermédiaire — orange
  return "#B0C4D4";                   // Débutant      — grey
}