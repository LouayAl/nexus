// apps/frontend/src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Building2, MapPin, AlertTriangle, Eye, Shield, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

type OfferStatus = "pending" | "approved" | "rejected";

const MOCK_PENDING = [
  { id:1, titre:"Senior React Developer",    company:"TechNova",   type:"CDI",      location:"Paris",      skills:["React","TypeScript","Node.js"],   date:"02 Mar 2026", desc:"Nous cherchons un développeur React senior pour rejoindre notre équipe produit." },
  { id:2, titre:"Growth Hacker",             company:"StartupXYZ", type:"CDI",      location:"Paris",      skills:["Marketing","Analytics","A/B Test"],date:"01 Mar 2026", desc:"Pilotez notre stratégie d'acquisition utilisateur et expérimentez de nouveaux leviers de croissance." },
  { id:3, titre:"ML Engineer",               company:"MedTech AI", type:"CDI",      location:"Lyon",       skills:["Python","TensorFlow","MLOps"],     date:"28 Fév 2026", desc:"Développez et déployez des modèles de machine learning pour nos produits santé." },
];

const STATS = [
  { value:"3",  label:"En attente",    color:"#EE813D", bg:"rgba(238,129,61,0.1)",   icon: Clock        },
  { value:"0",  label:"Approuvées",    color:"#1A9E6F", bg:"rgba(26,158,111,0.1)",   icon: CheckCircle  },
  { value:"0",  label:"Refusées",      color:"#D64045", bg:"rgba(214,64,69,0.1)",    icon: XCircle      },
  { value:"34", label:"Entreprises",   color:"#2284C0", bg:"rgba(34,132,192,0.1)",   icon: Building2    },
];

export default function AdminPage() {
  const [statuses, setStatuses] = useState<OfferStatus[]>(MOCK_PENDING.map(() => "pending"));
  const [expanded, setExpanded] = useState<number | null>(null);

  const approve = (i:number) => setStatuses(p => { const n=[...p]; n[i]="approved"; return n; });
  const reject  = (i:number) => setStatuses(p => { const n=[...p]; n[i]="rejected"; return n; });

  const counts = {
    pending:  statuses.filter(s=>s==="pending").length,
    approved: statuses.filter(s=>s==="approved").length,
    rejected: statuses.filter(s=>s==="rejected").length,
  };

  const dynamicStats = [
    { ...STATS[0], value: String(counts.pending)  },
    { ...STATS[1], value: String(counts.approved) },
    { ...STATS[2], value: String(counts.rejected) },
    { ...STATS[3] },
  ];

  return (
    <AppShell pageTitle="Administration">
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(214,64,69,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Shield size={15} color="#D64045"/>
          </div>
          <span style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#D64045" }}>
            Accès restreint
          </span>
        </div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em", marginBottom:6 }}>
          Panneau Administrateur
        </h1>
        <p style={{ color:"#5A7A96", fontSize:15 }}>Modérez les offres avant leur publication sur la plateforme</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:36 }}>
        {dynamicStats.map((s,i) => (
          <div key={i} style={{
            background:"white", border:"1px solid rgba(16,64,107,0.08)",
            borderRadius:16, padding:"20px 24px",
            display:"flex", alignItems:"center", gap:14,
            boxShadow:"0 1px 6px rgba(16,64,107,0.05)",
          }}>
            <div style={{ width:46, height:46, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <s.icon size={20} color={s.color}/>
            </div>
            <div>
              <div className="font-display" style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#5A7A96", marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Offers list */}
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>
        Offres en attente de validation
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {MOCK_PENDING.map((offer, i) => (
          <div key={offer.id} style={{
            background:"white", border:`1px solid ${
              statuses[i]==="approved" ? "rgba(26,158,111,0.25)"
            : statuses[i]==="rejected" ? "rgba(214,64,69,0.2)"
            : "rgba(16,64,107,0.08)"}`,
            borderRadius:16,
            boxShadow:"0 2px 8px rgba(16,64,107,0.05)",
            overflow:"hidden",
            transition:"all 0.2s",
          }}>
            {/* Status bar top */}
            <div style={{
              height:3,
              background: statuses[i]==="approved" ? "#1A9E6F"
                        : statuses[i]==="rejected"  ? "#D64045"
                        : "linear-gradient(90deg, #EE813D, #2284C0)",
            }}/>

            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
                <div style={{ flex:1, minWidth:240 }}>
                  {/* Title row */}
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                    <div className="font-display" style={{ fontSize:16, fontWeight:700, color:"#0D2137" }}>{offer.titre}</div>
                    <span style={{
                      fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:99,
                      background: statuses[i]==="approved" ? "rgba(26,158,111,0.1)"
                                : statuses[i]==="rejected"  ? "rgba(214,64,69,0.1)"
                                : "rgba(238,129,61,0.1)",
                      color: statuses[i]==="approved" ? "#1A9E6F"
                           : statuses[i]==="rejected"  ? "#D64045"
                           : "#EE813D",
                    }}>
                      {statuses[i]==="approved" ? "✓ Approuvée" : statuses[i]==="rejected" ? "✗ Refusée" : "⏳ En attente"}
                    </span>
                  </div>

                  {/* Meta */}
                  <div style={{ display:"flex", gap:16, color:"#5A7A96", fontSize:12, marginBottom:12, flexWrap:"wrap" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><Building2 size={11}/>{offer.company}</span>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/>{offer.location}</span>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={11}/>{offer.date}</span>
                  </div>

                  {/* Skills */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {offer.skills.map(s => (
                      <span key={s} style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", color:"#5A7A96", fontSize:11, padding:"3px 10px", borderRadius:8, fontWeight:500 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
                  {statuses[i]==="pending" ? (
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => reject(i)} style={{
                        display:"flex", alignItems:"center", gap:6,
                        padding:"9px 18px", borderRadius:10,
                        background:"rgba(214,64,69,0.06)", border:"1px solid rgba(214,64,69,0.2)",
                        color:"#D64045", fontSize:13, fontWeight:600,
                        cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background="rgba(214,64,69,0.12)")}
                      onMouseLeave={e => (e.currentTarget.style.background="rgba(214,64,69,0.06)")}
                      >
                        <XCircle size={15}/> Refuser
                      </button>
                      <button onClick={() => approve(i)} style={{
                        display:"flex", alignItems:"center", gap:6,
                        padding:"9px 18px", borderRadius:10,
                        background:"linear-gradient(135deg, #1A9E6F, #0d7a54)",
                        border:"none", color:"white", fontSize:13, fontWeight:700,
                        cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.18s",
                        boxShadow:"0 4px 12px rgba(26,158,111,0.3)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity="0.88")}
                      onMouseLeave={e => (e.currentTarget.style.opacity="1")}
                      >
                        <CheckCircle size={15}/> Approuver
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize:13, fontWeight:700, color:statuses[i]==="approved"?"#1A9E6F":"#D64045" }}>
                      {statuses[i]==="approved" ? "✓ Publiée" : "✗ Refusée"}
                    </div>
                  )}

                  {/* Preview toggle */}
                  <button onClick={() => setExpanded(expanded===i ? null : i)} style={{
                    display:"flex", alignItems:"center", gap:5,
                    background:"none", border:"none", color:"#5A7A96",
                    fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  }}>
                    <Eye size={13}/> {expanded===i ? "Masquer" : "Aperçu"}
                  </button>
                </div>
              </div>

              {/* Expandable description */}
              {expanded===i && (
                <div style={{
                  marginTop:16, padding:"14px 16px",
                  background:"#F7F8FA", borderRadius:10,
                  fontSize:13, color:"#5A7A96", lineHeight:1.7,
                  borderLeft:`3px solid #2284C0`,
                }}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#B0C4D4", marginBottom:6 }}>
                    Description de l'offre
                  </div>
                  {offer.desc}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}