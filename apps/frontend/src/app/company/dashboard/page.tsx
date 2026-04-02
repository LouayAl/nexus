// apps/frontend/src/app/company/dashboard/page.tsx
"use client";

import { useState } from "react";
import { Plus, Briefcase, Users, Award, CheckCircle, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Button, Card, Select, Textarea, StatCard } from "@/components/ui";
import { theme, STATUS_CONFIG } from "@/lib/theme";

const STATUS_CYCLE = ["EN_ATTENTE", "ENTRETIEN", "ACCEPTÉ", "REFUSÉ"] as const;

const MOCK_OFFERS = [
  { id: 1, title: "Senior React Developer", count: 4 },
  { id: 2, title: "DevOps Engineer", count: 2 },
  { id: 3, title: "Product Manager", count: 1 },
];

const MOCK_APPLICANTS = [
  { id: 1, name: "Yassine Benali", role: "Senior React Dev", exp: "5 ans", match: 94, statut: "ENTRETIEN", avatar: "YB" },
  { id: 2, name: "Fatima Zahra", role: "Frontend Dev", exp: "3 ans", match: 78, statut: "EN_ATTENTE", avatar: "FZ" },
  { id: 3, name: "Ahmed Khalil", role: "Full-Stack Dev", exp: "4 ans", match: 86, statut: "EN_ATTENTE", avatar: "AK" },
  { id: 4, name: "Nour Elmahdi", role: "React Specialist", exp: "6 ans", match: 91, statut: "ACCEPTÉ", avatar: "NE" },
];

export default function CompanyDashboardPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [statuses, setStatuses] = useState(MOCK_APPLICANTS.map((a) => a.statut));
  const [showModal, setShowModal] = useState(false);

  const [newOffer, setNewOffer] = useState({
    title: "",
    type: "CDI",
    salaire_min: "",
    salaire_max: "",
    description: "",
    skills: "",
  });

  const cycleStatus = (i: number) => {
    const cur = STATUS_CYCLE.indexOf(statuses[i] as never);
    const next = STATUS_CYCLE[(cur + 1) % STATUS_CYCLE.length];
    setStatuses((prev) => {
      const n = [...prev];
      n[i] = next;
      return n;
    });
  };

  const handleCreateOffer = () => {
    console.log("New offer:", newOffer);
    setShowModal(false);
    // TODO: call your backend API to save the offer
  };

  return (
    <AppShell pageTitle="Tableau de Bord Entreprise">
      <PageHeader
        title="Tableau de Bord"
        subtitle="Gérez vos offres et candidatures · TechNova"
        action={
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={14} />}
            onClick={() => setShowModal(true)}
          >
            Nouvelle offre
          </Button>
        }
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Offres actives" value="8" icon={Briefcase} color={theme.primary} />
        <StatCard label="Candidatures" value="142" icon={Users} color={theme.secondary} trend="+18 cette semaine" />
        <StatCard label="Entretiens" value="12" icon={Award} color={theme.accent} />
        <StatCard label="Recrutements" value="4" icon={CheckCircle} color={theme.success} trend="ce mois" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Offer list */}
        <div>
          <div style={{ color: theme.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Vos Offres
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_OFFERS.map((o) => (
              <Card
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                style={{
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderColor: selectedId === o.id ? theme.cardBorderHover : theme.cardBorder,
                  background: selectedId === o.id ? theme.primaryDim : undefined,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: theme.text, marginBottom: 3 }}>{o.title}</div>
                <div style={{ color: theme.textSub, fontSize: 12 }}>{o.count} candidat{o.count > 1 ? "s" : ""}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Applicants */}
        <div>
          <div style={{ color: theme.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Candidats · cliquez sur le statut pour le modifier
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_APPLICANTS.map((app, i) => {
              const sc = STATUS_CONFIG[statuses[i] as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.EN_ATTENTE;
              return (
                <Card key={app.id} style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {app.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{app.name}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ background: theme.accentDim, color: theme.accent, padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {app.match}% match
                          </span>
                          <button
                            onClick={() => cycleStatus(i)}
                            style={{
                              background: sc.bg,
                              color: sc.color,
                              border: `1px solid ${sc.color}30`,
                              padding: "3px 12px",
                              borderRadius: 100,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "'Outfit', sans-serif",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              transition: "all 0.2s",
                            }}
                          >
                            {sc.label}
                          </button>
                        </div>
                      </div>
                      <div style={{ color: theme.textSub, fontSize: 12, marginTop: 3 }}>
                        {app.role} · {app.exp} d'expérience
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ width: 480, background: "white", borderRadius: 12, padding: 24, position: "relative" }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.textSub,
              }}
            >
              <X size={18} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Créer une nouvelle offre</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input
                placeholder="Titre du poste"
                value={newOffer.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOffer({ ...newOffer, title: e.target.value })}
              />
              <Select
                value={newOffer.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewOffer({ ...newOffer, type: e.target.value })}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
              </Select>
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  type="number"
                  placeholder="Salaire min"
                  value={newOffer.salaire_min}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOffer({ ...newOffer, salaire_min: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Salaire max"
                  value={newOffer.salaire_max}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOffer({ ...newOffer, salaire_max: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={newOffer.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewOffer({ ...newOffer, description: e.target.value })}
              />
              <Input
                placeholder="Compétences (séparées par ,)"
                value={newOffer.skills}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewOffer({ ...newOffer, skills: e.target.value })}
              />
              <Button variant="primary" size="md" onClick={handleCreateOffer}>
                Créer l'offre
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}