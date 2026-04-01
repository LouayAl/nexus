// apps/frontend/src/app/profile/page.tsx
"use client";

import { useState } from "react";
import { Mail, Phone, Globe, MapPin, Plus, Upload, Edit2, Briefcase, Star, Award } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const SKILLS = [
  { name:"React / Next.js", level:95, color:"#2284C0"  },
  { name:"TypeScript",      level:88, color:"#10406B"  },
  { name:"Node.js",         level:82, color:"#1A9E6F"  },
  { name:"PostgreSQL",      level:75, color:"#EE813D"  },
  { name:"Docker / DevOps", level:65, color:"#7C3AED"  },
];

const EXPERIENCES = [
  { poste:"Senior Full-Stack Developer", company:"TechCorp SA",  duree:"2022 – Présent", desc:"Lead developer sur 3 produits SaaS, équipe de 8 personnes.", color:"#2284C0" },
  { poste:"React Developer",             company:"StartupLab",   duree:"2020 – 2022",    desc:"Développement frontend React, intégration API REST.", color:"#EE813D" },
  { poste:"Junior Developer",            company:"WebAgency",    duree:"2019 – 2020",    desc:"Sites web et applications pour clients PME.", color:"#1A9E6F" },
];

const FORMATIONS = [
  { diplome:"Master Informatique", ecole:"Université Paris-Saclay", annee:"2019", color:"#10406B" },
  { diplome:"Licence Info",        ecole:"Université de Lyon",       annee:"2017", color:"#7C3AED" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"skills"|"experience"|"formation">("skills");

  const tabs = [
    { key:"skills",     label:"Compétences", icon: Star      },
    { key:"experience", label:"Expérience",  icon: Briefcase },
    { key:"formation",  label:"Formation",   icon: Award     },
  ] as const;

  return (
    <AppShell pageTitle="Mon Profil">
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#EE813D", marginBottom:8 }}>
          Mon espace
        </div>
        <h1 className="font-display" style={{ fontSize:32, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>
          Mon Profil
        </h1>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24 }}>

        {/* Left column */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Identity card */}
          <div style={{
            background:"white", border:"1px solid rgba(16,64,107,0.08)",
            borderRadius:20, padding:28, textAlign:"center",
            boxShadow:"0 2px 12px rgba(16,64,107,0.06)",
          }}>
            {/* Avatar */}
            <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
              <div style={{
                width:88, height:88, borderRadius:"50%",
                background:"linear-gradient(135deg, #EE813D, #2284C0)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:30, fontWeight:900, color:"white", fontFamily:"'Fraunces',serif",
                margin:"0 auto",
              }}>YB</div>
              <button style={{
                position:"absolute", bottom:0, right:0,
                width:28, height:28, borderRadius:"50%",
                background:"#2284C0", border:"2px solid white",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer",
              }}>
                <Edit2 size={12} color="white"/>
              </button>
            </div>

            <div className="font-display" style={{ fontSize:22, fontWeight:800, color:"#0D2137", marginBottom:4 }}>
              Yassine Benali
            </div>
            <div style={{ color:"#5A7A96", fontSize:14, marginBottom:6 }}>Senior Full-Stack Developer</div>
            <div style={{ color:"#B0C4D4", fontSize:12, display:"flex", alignItems:"center", gap:4, justifyContent:"center" }}>
              <MapPin size={11}/> Casablanca, Maroc
            </div>

            {/* Profile completion */}
            <div style={{ margin:"20px 0", padding:"16px 0", borderTop:"1px solid rgba(16,64,107,0.07)", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>Profil complété</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#2284C0" }}>94%</span>
              </div>
              <div style={{ height:6, background:"#F0F4F8", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:"94%", height:"100%", borderRadius:3, background:"linear-gradient(90deg, #EE813D, #2284C0)" }}/>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:"flex", marginBottom:20 }}>
              {[["12","Candidatures"],["5","Ans exp."],["94%","Match"]].map(([v,l],i,arr) => (
                <div key={String(l)} style={{
                  flex:1, textAlign:"center",
                  borderRight:i<arr.length-1?"1px solid rgba(16,64,107,0.07)":"none",
                  padding:"0 8px",
                }}>
                  <div className="font-display" style={{ fontSize:20, fontWeight:800, color:"#2284C0" }}>{v}</div>
                  <div style={{ color:"#5A7A96", fontSize:11, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* CV Upload */}
            <button style={{
              width:"100%", padding:"11px",
              background:"linear-gradient(135deg, #EE813D, #d4691f)",
              border:"none", borderRadius:12,
              color:"white", fontSize:13, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 14px rgba(238,129,61,0.3)",
            }}>
              <Upload size={14}/> Importer mon CV
            </button>
          </div>

          {/* Contact */}
          <div style={{
            background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)",
            borderRadius:16, padding:20,
          }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>
              Contact
            </div>
            {[
              { Icon:Mail,  val:"y.benali@email.com",   href:"mailto:y.benali@email.com" },
              { Icon:Phone, val:"+212 6XX XXX XXX",      href:"tel:+212600000000" },
              { Icon:Globe, val:"linkedin.com/in/yb",    href:"#" },
            ].map(({Icon,val}) => (
              <div key={val} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={13} color="#2284C0"/>
                </div>
                <span style={{ color:"#5A7A96", fontSize:13 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{
          background:"white", border:"1px solid rgba(16,64,107,0.08)",
          borderRadius:20, padding:32,
          boxShadow:"0 2px 12px rgba(16,64,107,0.06)",
        }}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:28, background:"#F7F8FA", borderRadius:12, padding:4 }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex:1, padding:"9px 16px",
                  borderRadius:9, border:"none",
                  fontSize:13, fontWeight:600,
                  cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                  transition:"all 0.18s",
                  background: activeTab===tab.key ? "white" : "transparent",
                  color:      activeTab===tab.key ? "#10406B" : "#5A7A96",
                  boxShadow:  activeTab===tab.key ? "0 2px 8px rgba(16,64,107,0.08)" : "none",
                }}
              >
                <tab.icon size={14}/> {tab.label}
              </button>
            ))}
          </div>

          {/* Skills tab */}
          {activeTab==="skills" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>Compétences techniques</div>
                <button style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
              {SKILLS.map(({name,level,color}) => (
                <div key={name} style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"#0D2137" }}>{name}</span>
                    <span style={{ fontSize:13, fontWeight:700, color }}>{ level}%</span>
                  </div>
                  <div style={{ height:8, background:"#F0F4F8", borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${level}%`, borderRadius:4,
                      background:`linear-gradient(90deg, ${color}80, ${color})`,
                      transition:"width 0.6s cubic-bezier(0.22,1,0.36,1)",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience tab */}
          {activeTab==="experience" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>Expérience professionnelle</div>
                <button style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
              {EXPERIENCES.map((exp,i) => (
                <div key={i} style={{ display:"flex", gap:16, marginBottom:i<EXPERIENCES.length-1?28:0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:exp.color, marginTop:4, boxShadow:`0 0 0 4px ${exp.color}20` }}/>
                    {i<EXPERIENCES.length-1 && <div style={{ width:2, flex:1, background:"rgba(16,64,107,0.07)", marginTop:8, borderRadius:1 }}/>}
                  </div>
                  <div style={{ flex:1, paddingBottom:i<EXPERIENCES.length-1?8:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                      <div className="font-display" style={{ fontSize:15, fontWeight:700, color:"#0D2137" }}>{exp.poste}</div>
                      <span style={{ fontSize:11, color:"#5A7A96", background:"#F7F8FA", padding:"3px 10px", borderRadius:8, flexShrink:0, marginLeft:12 }}>{exp.duree}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:exp.color, marginBottom:6 }}>{exp.company}</div>
                    <div style={{ fontSize:13, color:"#5A7A96", lineHeight:1.6 }}>{exp.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formation tab */}
          {activeTab==="formation" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div className="font-display" style={{ fontSize:18, fontWeight:700, color:"#0D2137" }}>Formation</div>
                <button style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,132,192,0.08)", border:"none", color:"#2284C0", fontSize:12, fontWeight:600, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Plus size={13}/> Ajouter
                </button>
              </div>
              {FORMATIONS.map((f,i) => (
                <div key={i} style={{
                  background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)",
                  borderRadius:14, padding:"18px 20px", marginBottom:12,
                  borderLeft:`4px solid ${f.color}`,
                }}>
                  <div className="font-display" style={{ fontSize:15, fontWeight:700, color:"#0D2137", marginBottom:4 }}>{f.diplome}</div>
                  <div style={{ fontSize:13, color:"#5A7A96" }}>{f.ecole} · {f.annee}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}