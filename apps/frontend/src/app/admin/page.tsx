"use client";

import { useState } from "react";
import { AlertCircle, Eye, XCircle, Building2, CheckCircle, MapPin } from "lucide-react";
import { AppShell }   from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, StatCard, Badge, Button } from "@/components/ui";
import { theme } from "@/lib/theme";

const MOCK_PENDING = [
  { id:1, titre:"Senior React Developer", company:"TechNova",   type:"CDI", location:"Paris",     skills:["React","TypeScript"], date:"02 Mar 2026" },
  { id:2, titre:"Growth Hacker",          company:"StartupXYZ", type:"CDI", location:"Paris",     skills:["Marketing","Analytics"], date:"01 Mar 2026" },
  { id:3, titre:"ML Engineer",            company:"MedTech AI", type:"CDI", location:"Lyon",      skills:["Python","TensorFlow"], date:"28 Fév 2026" },
];

type OfferStatus = "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [statuses, setStatuses] = useState<OfferStatus[]>(MOCK_PENDING.map(() => "pending"));

  const approve = (i: number) => setStatuses((p) => { const n = [...p]; n[i] = "approved"; return n; });
  const reject  = (i: number) => setStatuses((p) => { const n = [...p]; n[i] = "rejected"; return n; });

  return (
    <AppShell pageTitle="Administration">
      <PageHeader
        title={<><span style={{ color: theme.danger }}>⬡ </span>Panneau Administrateur</>}
        subtitle="Modérez les offres avant publication · Accès restreint"
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="En attente"   value={statuses.filter(s=>s==="pending").length}  icon={AlertCircle} color={theme.warning} />
        <StatCard label="Publiées"     value={statuses.filter(s=>s==="approved").length} icon={Eye}         color={theme.success} />
        <StatCard label="Refusées"     value={statuses.filter(s=>s==="rejected").length} icon={XCircle}     color={theme.danger}  />
        <StatCard label="Entreprises"  value="34"                                         icon={Building2}   color={theme.primary} />
      </div>

      <div style={{ color: theme.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
        Offres en attente de validation
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_PENDING.map((offer, i) => (
          <Card key={offer.id} style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
                  <div className="font-syne" style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{offer.titre}</div>
                  <Badge variant={statuses[i]==="approved"?"success":statuses[i]==="rejected"?"danger":"warning"}>
                    {statuses[i]==="approved"?"Approuvée":statuses[i]==="rejected"?"Refusée":"En attente"}
                  </Badge>
                </div>
                <div style={{ color: theme.textSub, fontSize: 12, display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><Building2 size={11}/>{offer.company}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/>{offer.location}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {offer.skills.map((s) => (
                    <span key={s} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", color:theme.textSub, fontSize:11, padding:"2px 8px", borderRadius:6 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {statuses[i] === "pending" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="danger"   size="md" icon={<XCircle size={14}/>}     onClick={() => reject(i)}>Refuser</Button>
                  <Button variant="success"  size="md" icon={<CheckCircle size={14}/>} onClick={() => approve(i)}>Approuver</Button>
                </div>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 700, color: statuses[i]==="approved" ? theme.success : theme.danger }}>
                  {statuses[i]==="approved" ? "✓ Publiée" : "✗ Refusée"}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}