// apps/frontend/src/app/applications/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle, Clock, FileText, Users, Star, TrendingUp,
  ChevronRight, Building2, MapPin, ExternalLink, Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { STATUS_CONFIG } from "@/lib/theme";
import { candidaturesApi, type Candidature } from "@/lib/api";

const PIPELINE = ["Envoyée", "Vue", "Entretien", "Décision"];

// Map DB statut → pipeline step states
function getSteps(statut: string) {
  switch (statut) {
    case "EN_ATTENTE": return ["done","active","pending","pending"];
    case "VUE":        return ["done","done","active","pending"];
    case "ENTRETIEN":  return ["done","done","active","pending"];
    case "ACCEPTE":    return ["done","done","done","done"];
    case "REFUSE":     return ["done","done","pending","pending"];
    default:           return ["done","active","pending","pending"];
  }
}

function getNextStep(statut: string, titre: string) {
  switch (statut) {
    case "EN_ATTENTE": return "En attente de retour RH";
    case "VUE":        return "Votre candidature a été vue — en attente de retour";
    case "ENTRETIEN":  return `Entretien prévu pour le poste : ${titre}`;
    case "ACCEPTE":    return "🎉 Félicitations ! Offre acceptée";
    case "REFUSE":     return "Candidature non retenue";
    default:           return "En cours de traitement";
  }
}

function getEmoji(c: Candidature) {
  const skills = c.offre?.competences?.map(x => x.competence.nom) ?? [];
  if (skills.some(s => s.includes("React")))      return "⚛️";
  if (skills.some(s => s.includes("Python")))     return "🐍";
  if (skills.some(s => s.includes("Figma")))      return "🎨";
  if (skills.some(s => s.includes("Kubernetes"))) return "☁️";
  if (skills.some(s => s.includes("Pentest")))    return "🔒";
  return "💼";
}

function getColor(statut: string) {
  switch (statut) {
    case "ACCEPTE":  return "#1A9E6F";
    case "REFUSE":   return "#D64045";
    case "ENTRETIEN":return "#7C3AED";
    default:         return "#2284C0";
  }
}

// Normalise statut for STATUS_CONFIG key (handles ACCEPTE vs ACCEPTÉ)
function toConfigKey(statut: string) {
  const map: Record<string, string> = {
    EN_ATTENTE: "EN_ATTENTE",
    VUE:        "EN_ATTENTE",
    ENTRETIEN:  "ENTRETIEN",
    ACCEPTE:    "ACCEPTÉ",
    REFUSE:     "REFUSÉ",
  };
  return (map[statut] ?? "EN_ATTENTE") as keyof typeof STATUS_CONFIG;
}

export default function ApplicationsPage() {
  const [selected, setSelected] = useState(0);

  const { data: candidatures = [], isLoading } = useQuery({
    queryKey: ["mes-candidatures"],
    queryFn:  () => candidaturesApi.getMy().then(r => r.data),
  });

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total      = candidatures.length;
  const entretiens = candidatures.filter(c => c.statut === "ENTRETIEN").length;
  const acceptees  = candidatures.filter(c => c.statut === "ACCEPTE").length;
  const vues       = candidatures.filter(c => ["VUE","ENTRETIEN","ACCEPTE","REFUSE"].includes(c.statut)).length;
  const tauxReponse = total > 0 ? Math.round((vues / total) * 100) : 0;

  const STATS = [
    { value: String(total),          label:"Candidatures",    icon: FileText,   color:"#2284C0" },
    { value: String(entretiens),     label:"Entretiens",      icon: Users,      color:"#EE813D" },
    { value: String(acceptees),      label:"Offres reçues",   icon: Star,       color:"#1A9E6F" },
    { value: `${tauxReponse}%`,      label:"Taux de réponse", icon: TrendingUp, color:"#10406B" },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <AppShell pageTitle="Mes Candidatures">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400, flexDirection:"column", gap:16 }}>
        <Loader2 size={32} color="#2284C0" style={{ animation:"spin 1s linear infinite" }}/>
        <div style={{ color:"#5A7A96", fontSize:14 }}>Chargement de vos candidatures…</div>
      </div>
    </AppShell>
  );

  // ── Empty state ────────────────────────────────────────────────────────────
  if (candidatures.length === 0) return (
    <AppShell pageTitle="Mes Candidatures">
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Mon espace</div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em", marginBottom:6 }}>Mes Candidatures</h1>
        <p style={{ color:"#5A7A96", fontSize:15 }}>Suivez l'avancement de vos candidatures en temps réel</p>
      </div>
      <div style={{ textAlign:"center", padding:"80px 0" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
        <div className="font-display" style={{ fontSize:22, fontWeight:700, color:"#10406B", marginBottom:8 }}>Aucune candidature pour l'instant</div>
        <div style={{ color:"#5A7A96", fontSize:14 }}>Parcourez les offres et postulez pour voir vos candidatures ici.</div>
      </div>
    </AppShell>
  );

  const app = candidatures[selected];
  const sc  = STATUS_CONFIG[toConfigKey(app.statut)];
  const steps    = getSteps(app.statut);
  const nextStep = getNextStep(app.statut, app.offre?.titre ?? "");
  const emoji    = getEmoji(app);
  const color    = getColor(app.statut);

  return (
    <AppShell pageTitle="Mes Candidatures">
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>Mon espace</div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em", marginBottom:6 }}>Mes Candidatures</h1>
        <p style={{ color:"#5A7A96", fontSize:15 }}>Suivez l'avancement de vos candidatures en temps réel</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:36 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background:"white", border:"1px solid rgba(16,64,107,0.08)",
            borderRadius:16, padding:"20px 24px",
            display:"flex", alignItems:"center", gap:14,
            boxShadow:"0 1px 6px rgba(16,64,107,0.05)",
          }}>
            <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <s.icon size={20} color={s.color}/>
            </div>
            <div>
              <div className="font-display" style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#5A7A96", marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20 }}>

        {/* Left — list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:4 }}>
            Toutes mes candidatures
          </div>
          {candidatures.map((c, i) => {
            const s = STATUS_CONFIG[toConfigKey(c.statut)];
            return (
              <div
                key={c.id}
                onClick={() => setSelected(i)}
                style={{
                  background: selected===i ? "white" : "#F7F8FA",
                  border:`1px solid ${selected===i ? "rgba(34,132,192,0.3)" : "rgba(16,64,107,0.08)"}`,
                  borderRadius:14, padding:"16px 18px",
                  cursor:"pointer", transition:"all 0.2s",
                  boxShadow: selected===i ? "0 4px 20px rgba(16,64,107,0.1)" : "none",
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:20 }}>{getEmoji(c)}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:"#0D2137", lineHeight:1.3 }}>
                        {c.offre?.titre ?? "Offre supprimée"}
                      </div>
                      <div style={{ fontSize:11, color:"#5A7A96", marginTop:2 }}>
                        {c.offre?.entreprise?.nom ?? "—"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color={selected===i ? "#2284C0" : "#B0C4D4"}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#5A7A96" }}>
                    {new Date(c.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}
                  </span>
                  <span style={{
                    background:s.bg, color:s.color,
                    fontSize:10, fontWeight:700, padding:"2px 8px",
                    borderRadius:99, textTransform:"uppercase", letterSpacing:"0.04em",
                  }}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — detail */}
        <div style={{
          background:"white", border:"1px solid rgba(16,64,107,0.08)",
          borderRadius:20, padding:32,
          boxShadow:"0 2px 12px rgba(16,64,107,0.06)",
        }}>
          {/* Company header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <div style={{
                width:56, height:56, borderRadius:14, flexShrink:0,
                background:`${color}12`, border:`1px solid ${color}30`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
              }}>{emoji}</div>
              <div>
                <div className="font-display" style={{ fontSize:20, fontWeight:800, color:"#0D2137", marginBottom:4 }}>
                  {app.offre?.titre ?? "Offre supprimée"}
                </div>
                <div style={{ color:"#5A7A96", fontSize:13, display:"flex", gap:12, flexWrap:"wrap" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <Building2 size={12}/>{app.offre?.entreprise?.nom ?? "—"}
                  </span>
                  {app.offre?.localisation && (
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <MapPin size={12}/>{app.offre.localisation}
                    </span>
                  )}
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <Clock size={12}/>
                    {new Date(app.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{
                background:sc.bg, color:sc.color,
                padding:"6px 16px", borderRadius:99,
                fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em",
              }}>{sc.label}</span>
              <button style={{
                width:36, height:36, borderRadius:10,
                background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.1)",
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              }}>
                <ExternalLink size={15} color="#5A7A96"/>
              </button>
            </div>
          </div>

          {/* Next step banner */}
          <div style={{
            background: app.statut==="ACCEPTE" ? "rgba(26,158,111,0.07)"
                      : app.statut==="REFUSE"  ? "rgba(214,64,69,0.06)"
                      : "rgba(34,132,192,0.06)",
            border:`1px solid ${
              app.statut==="ACCEPTE" ? "rgba(26,158,111,0.2)"
            : app.statut==="REFUSE"  ? "rgba(214,64,69,0.15)"
            : "rgba(34,132,192,0.15)"}`,
            borderRadius:12, padding:"12px 18px", marginBottom:32,
            display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:16 }}>
              {app.statut==="ACCEPTE" ? "🎉" : app.statut==="REFUSE" ? "😔" : "📌"}
            </span>
            <span style={{ fontSize:13, fontWeight:600, color:"#0D2137" }}>{nextStep}</span>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:20 }}>
              Progression
            </div>
            <div style={{ display:"flex", alignItems:"flex-start" }}>
              {PIPELINE.map((step, j) => {
                const state = steps[j];
                const dotColor = state==="done" ? "#1A9E6F" : state==="active" ? "#2284C0" : "#B0C4D4";
                return (
                  <div key={j} style={{ flex:1, display:"flex", flexDirection:"column", alignItems: j===0?"flex-start":j===PIPELINE.length-1?"flex-end":"center" }}>
                    <div style={{ width:"100%", display:"flex", alignItems:"center" }}>
                      {j>0 && <div style={{ flex:1, height:2, borderRadius:1, background:steps[j-1]==="done"?"#1A9E6F":"rgba(16,64,107,0.08)" }}/>}
                      <div style={{
                        width:28, height:28, borderRadius:"50%", flexShrink:0,
                        background: state==="done" ? "rgba(26,158,111,0.1)" : state==="active" ? "rgba(34,132,192,0.1)" : "#F7F8FA",
                        border:`2px solid ${dotColor}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow: state==="active" ? "0 0 0 4px rgba(34,132,192,0.1)" : "none",
                        transition:"all 0.3s",
                      }}>
                        {state==="done"   && <CheckCircle size={13} color="#1A9E6F"/>}
                        {state==="active" && <div style={{ width:8, height:8, borderRadius:"50%", background:"#2284C0" }}/>}
                      </div>
                      {j<PIPELINE.length-1 && <div style={{ flex:1, height:2, borderRadius:1, background:state==="done"?"#1A9E6F":"rgba(16,64,107,0.08)" }}/>}
                    </div>
                    <div style={{
                      fontSize:11, fontWeight:700, marginTop:8,
                      textTransform:"uppercase", letterSpacing:"0.05em",
                      color:dotColor, textAlign:"center",
                    }}>{step}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cover letter if present */}
          {app.lettre && (
            <div style={{ marginTop:28, padding:"16px 20px", background:"#F7F8FA", borderRadius:12, border:"1px solid rgba(16,64,107,0.07)" }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:8 }}>
                Votre lettre de motivation
              </div>
              <p style={{ fontSize:13, color:"#3D5A73", lineHeight:1.7, margin:0 }}>{app.lettre}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}