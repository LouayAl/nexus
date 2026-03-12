"use client";

import { useState } from "react";
import { CheckCircle, FileText, Users, Star, TrendingUp } from "lucide-react";
import { AppShell }     from "@/components/layout/AppShell";
import { PageHeader }   from "@/components/ui/PageHeader";
import { Card, StatCard } from "@/components/ui";
import { theme, STATUS_CONFIG } from "@/lib/theme";

const PIPELINE = ["Envoyée", "Vue", "Entretien", "Décision"];

type StepState = "done" | "active" | "pending";

const MOCK_APPS = [
  { company:"TechNova",          title:"Senior React Developer", date:"28 Fév 2026", statut:"ENTRETIEN",  steps:["done","done","active","pending"] as StepState[] },
  { company:"DataVision",        title:"Data Analyst",           date:"20 Fév 2026", statut:"EN_ATTENTE", steps:["done","active","pending","pending"] as StepState[] },
  { company:"PixelForge Studio", title:"UX/UI Design Lead",      date:"15 Fév 2026", statut:"ACCEPTÉ",    steps:["done","done","done","done"] as StepState[] },
  { company:"CloudBase",         title:"DevOps Engineer",        date:"10 Fév 2026", statut:"REFUSÉ",     steps:["done","done","pending","pending"] as StepState[] },
];

export default function ApplicationsPage() {
  const [apps] = useState(MOCK_APPS);

  return (
    <AppShell pageTitle="Mes Candidatures">
      <PageHeader title="Mes Candidatures" subtitle="Suivez l'avancement de vos candidatures en temps réel" />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total"         value={apps.length} icon={FileText}   color={theme.primary} />
        <StatCard label="Entretiens"    value={1}           icon={Users}       color={theme.secondary} trend="+2 cette semaine" />
        <StatCard label="Offres reçues" value={1}           icon={Star}        color={theme.success} />
        <StatCard label="Taux réponse"  value="75%"         icon={TrendingUp}  color={theme.accent}  trend="+12%" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {apps.map((app, i) => {
          const sc = STATUS_CONFIG[app.statut as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.EN_ATTENTE;
          return (
            <Card key={i} style={{ padding: 24 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div className="font-syne" style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 4 }}>{app.title}</div>
                  <div style={{ color: theme.textSub, fontSize: 13 }}>{app.company} · {app.date}</div>
                </div>
                <span style={{ background: sc.bg, color: sc.color, padding: "5px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {sc.label}
                </span>
              </div>

              {/* Timeline */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                {PIPELINE.map((step, j) => {
                  const state = app.steps[j];
                  const dotColor =
                    state === "done"   ? theme.success :
                    state === "active" ? theme.primary : theme.textFaint;
                  return (
                    <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: j===0?"flex-start":j===PIPELINE.length-1?"flex-end":"center" }}>
                      <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                        {j > 0 && <div style={{ flex: 1, height: 2, borderRadius: 1, background: app.steps[j-1]==="done" ? theme.success : "rgba(255,255,255,0.06)" }} />}
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                          background: state==="done" ? theme.successDim : state==="active" ? theme.primaryDim : "rgba(255,255,255,0.03)",
                          border: `2px solid ${dotColor}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {state === "done"   && <CheckCircle size={13} color={theme.success} />}
                          {state === "active" && <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.primary }} />}
                        </div>
                        {j < PIPELINE.length-1 && <div style={{ flex: 1, height: 2, borderRadius: 1, background: state==="done" ? theme.success : "rgba(255,255,255,0.06)" }} />}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, marginTop: 7, textTransform: "uppercase", letterSpacing: "0.05em", color: dotColor, textAlign: "center", maxWidth: 68 }}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}