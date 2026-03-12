"use client";

import { Mail, Phone, Globe, MapPin, Plus, Upload } from "lucide-react";
import { AppShell }   from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, Button } from "@/components/ui";
import { theme } from "@/lib/theme";

const SKILLS = [
  { name:"React / Next.js", level:95, color:theme.primary   },
  { name:"TypeScript",      level:88, color:theme.secondary },
  { name:"Node.js",         level:82, color:theme.accent    },
  { name:"PostgreSQL",      level:75, color:theme.warning   },
  { name:"Docker / DevOps", level:65, color:theme.success   },
];

const EXPERIENCES = [
  { poste:"Senior Full-Stack Developer", company:"TechCorp SA", duree:"2022 – Présent", color:theme.primary   },
  { poste:"React Developer",             company:"StartupLab",  duree:"2020 – 2022",    color:theme.secondary },
  { poste:"Junior Developer",            company:"WebAgency",   duree:"2019 – 2020",    color:theme.accent    },
];

export default function ProfilePage() {
  return (
    <AppShell pageTitle="Mon Profil">
      <PageHeader title="Mon Profil" subtitle="Gérez vos informations et compétences" />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 28, textAlign: "center" }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%", margin: "0 auto 16px",
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 800, color: "white", fontFamily:"'Syne', sans-serif",
            }}>YB</div>
            <div className="font-syne" style={{ fontWeight: 800, fontSize: 20, color: theme.text, marginBottom: 4 }}>Yassine Benali</div>
            <div style={{ color: theme.textSub, fontSize: 13, marginBottom: 4 }}>Senior Full-Stack Developer</div>
            <div style={{ color: theme.textSub, fontSize: 12, display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              <MapPin size={11} /> Casablanca, Maroc
            </div>
            <div style={{ display:"flex", margin:"18px 0", borderTop:`1px solid ${theme.cardBorder}`, borderBottom:`1px solid ${theme.cardBorder}`, padding:"16px 0" }}>
              {[["12","Candidatures"],["94%","Profil"],["5","Ans exp."]].map(([v,l],i,arr) => (
                <div key={String(l)} style={{ flex:1, textAlign:"center", borderRight:i<arr.length-1?`1px solid ${theme.cardBorder}`:"none" }}>
                  <div className="font-syne" style={{ fontWeight:800, fontSize:20, color:theme.primary }}>{v}</div>
                  <div style={{ color:theme.textSub, fontSize:11 }}>{l}</div>
                </div>
              ))}
            </div>
            <Button variant="primary" className="w-full justify-center" icon={<Upload size={14}/>} style={{ width:"100%", justifyContent:"center" }}>
              Importer CV
            </Button>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ color:theme.textSub, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Contact</div>
            {[
              { Icon:Mail,  val:"y.benali@email.com" },
              { Icon:Phone, val:"+212 6XX XXX XXX"   },
              { Icon:Globe, val:"linkedin.com/in/yb"  },
            ].map(({Icon,val}) => (
              <div key={val} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12, color:theme.textSub, fontSize:13 }}>
                <Icon size={14} color={theme.primary}/> {val}
              </div>
            ))}
          </Card>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div className="font-syne" style={{ fontWeight:700, fontSize:15, color:theme.text }}>Compétences</div>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:theme.primary, fontSize:12, fontWeight:600, fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:4 }}>
                <Plus size={13}/> Ajouter
              </button>
            </div>
            {SKILLS.map(({name,level,color}) => (
              <div key={name} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:theme.text }}>{name}</span>
                  <span style={{ fontSize:12, color:theme.textSub }}>{level}%</span>
                </div>
                <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${level}%`, borderRadius:2, background:`linear-gradient(90deg, ${color}70, ${color})` }}/>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ padding: 24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div className="font-syne" style={{ fontWeight:700, fontSize:15, color:theme.text }}>Expérience</div>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:theme.primary, fontSize:12, fontWeight:600, fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:4 }}>
                <Plus size={13}/> Ajouter
              </button>
            </div>
            {EXPERIENCES.map((exp,i) => (
              <div key={i} style={{ display:"flex", gap:14, marginBottom:i<EXPERIENCES.length-1?18:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:exp.color, flexShrink:0, marginTop:4 }}/>
                  {i<EXPERIENCES.length-1 && <div style={{ width:1, flex:1, background:"rgba(255,255,255,0.06)", marginTop:4 }}/>}
                </div>
                <div style={{ paddingBottom:i<EXPERIENCES.length-1?18:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:theme.text }}>{exp.poste}</div>
                  <div style={{ color:theme.textSub, fontSize:13 }}>{exp.company} · {exp.duree}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}