"use client";

import { useState, useRef } from "react";
import {
  Search, MapPin, Briefcase, ArrowRight, ChevronLeft, ChevronRight,
  Building2, Clock, Star, TrendingUp, Users, Zap, Globe, Heart,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import type { Offre } from "@/lib/api";

// ─── DATA ────────────────────────────────────────────────────────────────────
const OFFRES: Offre[] = [
  { id:1,  titre:"Senior React Developer",     description:"", type_contrat:"CDI",       niveau_experience:"Senior",       statut:"OUVERTE", localisation:"Paris · Remote",  salaire_min:55000, salaire_max:75000, entreprise:{ utilisateur_id:1, nom:"TechNova"           }, competences:[{id:1,nom:"React"},{id:2,nom:"TypeScript"},{id:3,nom:"Node.js"}] },
  { id:2,  titre:"Data Analyst",               description:"", type_contrat:"CDD",       niveau_experience:"Intermédiaire",statut:"OUVERTE", localisation:"Lyon",            salaire_min:40000, salaire_max:50000, entreprise:{ utilisateur_id:2, nom:"DataVision"         }, competences:[{id:4,nom:"Python"},{id:5,nom:"SQL"},{id:6,nom:"Tableau"}] },
  { id:3,  titre:"UX/UI Design Lead",          description:"", type_contrat:"Freelance",  niveau_experience:"Senior",       statut:"OUVERTE", localisation:"Remote",          salaire_min:45000, salaire_max:60000, entreprise:{ utilisateur_id:3, nom:"PixelForge"         }, competences:[{id:7,nom:"Figma"},{id:8,nom:"Prototyping"},{id:9,nom:"Design Systems"}] },
  { id:4,  titre:"Java Backend Engineer",      description:"", type_contrat:"CDI",       niveau_experience:"Senior",       statut:"OUVERTE", localisation:"Casablanca",      salaire_min:50000, salaire_max:70000, entreprise:{ utilisateur_id:4, nom:"FinServ Global"     }, competences:[{id:10,nom:"Java"},{id:11,nom:"Spring Boot"},{id:12,nom:"PostgreSQL"}] },
  { id:5,  titre:"DevOps Engineer",            description:"", type_contrat:"CDI",       niveau_experience:"Senior",       statut:"OUVERTE", localisation:"Paris · Hybrid",  salaire_min:60000, salaire_max:80000, entreprise:{ utilisateur_id:5, nom:"CloudBase"          }, competences:[{id:13,nom:"Kubernetes"},{id:14,nom:"AWS"},{id:15,nom:"Terraform"}] },
  { id:6,  titre:"Product Manager",            description:"", type_contrat:"CDI",       niveau_experience:"Intermédiaire",statut:"OUVERTE", localisation:"Bordeaux",        salaire_min:55000, salaire_max:70000, entreprise:{ utilisateur_id:6, nom:"LaunchPad"          }, competences:[{id:16,nom:"Agile"},{id:17,nom:"Roadmapping"},{id:18,nom:"Analytics"}] },
  { id:7,  titre:"ML Engineer",                description:"", type_contrat:"CDI",       niveau_experience:"Senior",       statut:"OUVERTE", localisation:"Paris",           salaire_min:65000, salaire_max:85000, entreprise:{ utilisateur_id:7, nom:"MedTech AI"         }, competences:[{id:19,nom:"Python"},{id:20,nom:"TensorFlow"},{id:21,nom:"PyTorch"}] },
  { id:8,  titre:"React Native Developer",     description:"", type_contrat:"CDI",       niveau_experience:"Intermédiaire",statut:"OUVERTE", localisation:"Remote",          salaire_min:45000, salaire_max:60000, entreprise:{ utilisateur_id:8, nom:"AppCraft"           }, competences:[{id:22,nom:"React Native"},{id:23,nom:"TypeScript"},{id:24,nom:"Redux"}] },
  { id:9,  titre:"Cybersecurity Analyst",      description:"", type_contrat:"CDI",       niveau_experience:"Intermédiaire",statut:"OUVERTE", localisation:"Paris",           salaire_min:48000, salaire_max:65000, entreprise:{ utilisateur_id:9, nom:"SecureNet"          }, competences:[{id:25,nom:"Pentest"},{id:26,nom:"SIEM"},{id:27,nom:"ISO 27001"}] },
  { id:10, titre:"Marketing Digital Manager",  description:"", type_contrat:"CDI",       niveau_experience:"Senior",       statut:"OUVERTE", localisation:"Paris · Hybrid",  salaire_min:45000, salaire_max:58000, entreprise:{ utilisateur_id:10, nom:"BrandUp"          }, competences:[{id:28,nom:"SEO"},{id:29,nom:"Google Ads"},{id:30,nom:"Analytics"}] },
];

const CATEGORIES = [
  { label:"Toutes",       icon:"✦",  filter: null              },
  { label:"Tech",         icon:"⚡", filter:"React"            },
  { label:"Data",         icon:"📊", filter:"Python"           },
  { label:"Design",       icon:"🎨", filter:"Figma"            },
  { label:"Management",   icon:"🚀", filter:"Agile"            },
  { label:"Marketing",    icon:"📣", filter:"SEO"              },
  { label:"DevOps",       icon:"☁️", filter:"Kubernetes"       },
  { label:"Sécurité",     icon:"🔒", filter:"Pentest"          },
];

const COMPANIES = [
  { name:"TechNova",     color:"#2284C0", initial:"T" },
  { name:"DataVision",   color:"#EE813D", initial:"D" },
  { name:"PixelForge",   color:"#7C3AED", initial:"P" },
  { name:"FinServ",      color:"#10406B", initial:"F" },
  { name:"CloudBase",    color:"#059669", initial:"C" },
  { name:"LaunchPad",    color:"#DC2626", initial:"L" },
  { name:"MedTech AI",   color:"#0891B2", initial:"M" },
  { name:"AppCraft",     color:"#D97706", initial:"A" },
  { name:"SecureNet",    color:"#4F46E5", initial:"S" },
  { name:"BrandUp",      color:"#BE185D", initial:"B" },
];

const STATS = [
  { value:"12 000+", label:"Offres actives",   icon: Briefcase  },
  { value:"3 400+",  label:"Entreprises",       icon: Building2  },
  { value:"98 000+", label:"Candidats inscrits",icon: Users      },
  { value:"89%",     label:"Taux de placement", icon: TrendingUp },
];

const CONTRACT_STYLES: Record<string, { bg: string; color: string }> = {
  CDI:       { bg: "rgba(26,158,111,0.1)",  color: "#1A9E6F" },
  CDD:       { bg: "rgba(238,129,61,0.12)", color: "#EE813D" },
  Freelance: { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED" },
  Stage:     { bg: "rgba(34,132,192,0.1)",  color: "#2284C0" },
};

// ─── JOB CARD ─────────────────────────────────────────────────────────────────
function JobCard({ offre, featured = false }: { offre: Offre; featured?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [hov,   setHov]   = useState(false);
  const contract = CONTRACT_STYLES[offre.type_contrat] ?? { bg: "rgba(16,64,107,0.08)", color: "#10406B" };
  const salary   = offre.salaire_min && offre.salaire_max
    ? `${Math.round(offre.salaire_min/1000)}K – ${Math.round(offre.salaire_max/1000)}K €`
    : null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:    "white",
        border:        `1px solid ${hov ? "rgba(34,132,192,0.25)" : "rgba(16,64,107,0.09)"}`,
        borderRadius:  20,
        padding:       featured ? "28px 24px" : "22px 20px",
        flexShrink:    0,
        width:         featured ? 320 : 290,
        display:       "flex",
        flexDirection: "column",
        gap:           16,
        cursor:        "pointer",
        transition:    "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        transform:     hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow:     hov ? "0 16px 40px rgba(16,64,107,0.13)" : "0 2px 8px rgba(16,64,107,0.06)",
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      {/* Decorative top stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: hov ? "linear-gradient(90deg, #EE813D, #2284C0)" : "transparent",
        transition: "background 0.3s ease",
        borderRadius: "20px 20px 0 0",
      }}/>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: `linear-gradient(135deg, ${contract.color}18, ${contract.color}30)`,
          border: `1px solid ${contract.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          {offre.competences?.[0]?.nom.includes("React") ? "⚛️" :
           offre.competences?.[0]?.nom.includes("Python") ? "🐍" :
           offre.competences?.[0]?.nom.includes("Figma") ? "🎨" :
           offre.competences?.[0]?.nom.includes("Kubernetes") ? "☁️" :
           offre.competences?.[0]?.nom.includes("Java") ? "☕" :
           offre.competences?.[0]?.nom.includes("Pentest") ? "🔒" :
           offre.competences?.[0]?.nom.includes("SEO") ? "📣" : "💼"}
        </div>
        <button
          onClick={e => { e.stopPropagation(); setSaved(!saved); }}
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: saved ? "rgba(238,129,61,0.1)" : "rgba(16,64,107,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <Heart size={14} fill={saved ? "#EE813D" : "none"} color={saved ? "#EE813D" : "#5A7A96"} />
        </button>
      </div>

      {/* Info */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{
            ...contract, fontSize: 11, fontWeight: 700,
            padding: "2px 8px", borderRadius: 99, letterSpacing: "0.04em",
          }}>
            {offre.type_contrat}
          </span>
          {featured && (
            <span style={{ background: "rgba(238,129,61,0.1)", color: "#EE813D", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
              ⭐ En vedette
            </span>
          )}
        </div>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#0D2137", marginBottom: 4, lineHeight: 1.3 }}>
          {offre.titre}
        </div>
        <div style={{ fontSize: 13, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4 }}>
          <Building2 size={11}/> {offre.entreprise.nom}
          {offre.localisation && <> &nbsp;·&nbsp; <MapPin size={11}/> {offre.localisation}</>}
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {offre.competences?.slice(0,3).map(c => (
          <span key={c.id} style={{
            background: "#F0F4F8", color: "#5A7A96",
            fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 8,
          }}>{c.nom}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        {salary ? (
          <div style={{ fontSize: 14, fontWeight: 700, color: "#10406B" }}>{salary} / an</div>
        ) : <div/>}
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 99,
          background: hov ? "linear-gradient(135deg, #EE813D, #2284C0)" : "#F0F4F8",
          border: "none", color: hov ? "white" : "#10406B",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          transition: "all 0.25s", fontFamily: "'DM Sans', sans-serif",
        }}>
          Postuler {hov && <ArrowRight size={12}/>}
        </button>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [keyword,  setKeyword]  = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const sliderRef  = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filtered = OFFRES.filter(o => {
    const kw  = keyword.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const matchKw  = !kw  || o.titre.toLowerCase().includes(kw) || o.competences?.some(c => c.nom.toLowerCase().includes(kw));
    const matchLoc = !loc || o.localisation?.toLowerCase().includes(loc);
    const matchCat = !category || o.competences?.some(c => c.nom === category);
    return matchKw && matchLoc && matchCat;
  });

  const featured = OFFRES.slice(0, 5);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  return (
    <AppShell pageTitle="Découvrir les offres" fullWidth>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ position:"relative", overflow:"hidden", minHeight:520 }}>
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80&auto=format&fit=crop"
          alt="People working"
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center 30%",
          }}
        />

        {/* Overlay gradient — so text stays readable */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(105deg, rgba(16,64,107,0.92) 0%, rgba(16,64,107,0.75) 50%, rgba(34,132,192,0.4) 100%)",
        }}/>

        {/* Content — centered */}
        <div style={{
          position:"relative", zIndex:1,
          maxWidth:1200, margin:"0 auto",
          padding:"80px 48px 90px",
          display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
        }}>
          {/* Live badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)",
            borderRadius:99, padding:"6px 18px", marginBottom:28,
            border:"1px solid rgba(255,255,255,0.15)",
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#EE813D", display:"inline-block" }}/>
            <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.9)", letterSpacing:"0.03em" }}>
              {OFFRES.length} nouvelles offres cette semaine
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display" style={{
            fontSize:"clamp(36px,5vw,60px)", fontWeight:900,
            color:"white", lineHeight:1.1, marginBottom:18,
            letterSpacing:"-0.025em", maxWidth:720,
          }}>
            Votre prochain emploi<br/>
            <span style={{ color:"#EE813D", fontStyle:"italic" }}>vous attend.</span>
          </h1>
          <p style={{
            fontSize:17, color:"rgba(255,255,255,0.65)",
            lineHeight:1.75, marginBottom:44, maxWidth:500,
          }}>
            Connectez talent et opportunité. Des milliers d'offres sélectionnées pour votre prochaine grande étape.
          </p>

          {/* Search box */}
          <div style={{
            background:"white", borderRadius:18, padding:8,
            display:"flex", gap:0, width:"100%", maxWidth:780,
            boxShadow:"0 24px 64px rgba(0,0,0,0.25)",
          }}>
            {/* Keyword */}
            <div style={{ flex:2, display:"flex", alignItems:"center", gap:12, padding:"4px 20px", borderRight:"1px solid rgba(16,64,107,0.1)" }}>
              <Briefcase size={20} color="#2284C0" style={{ flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#5A7A96", marginBottom:2 }}>
                  Poste ou compétence
                </div>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Ex : Développeur React, Data Analyst…"
                  style={{ border:"none", outline:"none", width:"100%", fontSize:14, fontWeight:500, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"none", padding:"4px 0" }}
                />
              </div>
            </div>

            {/* Location */}
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:12, padding:"4px 20px" }}>
              <MapPin size={20} color="#EE813D" style={{ flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#5A7A96", marginBottom:2 }}>
                  Localisation
                </div>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Paris, Remote, Lyon…"
                  style={{ border:"none", outline:"none", width:"100%", fontSize:14, fontWeight:500, color:"#0D2137", fontFamily:"'DM Sans',sans-serif", background:"none", padding:"4px 0" }}
                />
              </div>
            </div>

            {/* CTA */}
            <button style={{
              background:"linear-gradient(135deg, #EE813D, #d4691f)",
              border:"none", borderRadius:12,
              padding:"0 32px", color:"white",
              fontSize:15, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:8,
              fontFamily:"'DM Sans',sans-serif",
              boxShadow:"0 4px 16px rgba(238,129,61,0.4)",
              transition:"opacity 0.2s", whiteSpace:"nowrap", minWidth:150,
            }}
            onClick={() => {
              setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
              }, 100);
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity="0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity="1")}
            >
              <Search size={16}/> Rechercher
            </button>
          </div>

          {/* Popular tags */}
          <div style={{ display:"flex", gap:8, marginTop:20, flexWrap:"wrap", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>Tendances :</span>
            {["React","Python","Remote","DevOps","Product Manager","Data"].map(tag => (
              <button key={tag} 
                onClick={() => {
                  setKeyword(tag);
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
                  }, 100);
                }}
                style={{
                padding:"5px 14px", borderRadius:99,
                background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)",
                color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:500,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.1)")}
              >{tag}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════════════ */}
      <section style={{
        background: "white",
        borderBottom: "1px solid rgba(16,64,107,0.08)",
        padding: "0",
        display: "flex",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 48px", display:"flex" }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{
              flex: 1, display:"flex", alignItems:"center", gap:14,
              padding: "22px 0",
              borderRight: i < STATS.length-1 ? "1px solid rgba(16,64,107,0.08)" : "none",
              justifyContent: "center",
            }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <stat.icon size={18} color="#2284C0"/>
              </div>
              <div>
                <div className="font-display" style={{ fontSize:22, fontWeight:700, color:"#10406B", lineHeight:1 }}>{stat.value}</div>
                <div style={{ fontSize:12, color:"#5A7A96", marginTop:3, fontWeight:500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURED SLIDER ═══════════════════════════════════════════ */}
      <section style={{ padding:"56px 0 48px", overflow:"visible" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 48px" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <Star size={16} color="#EE813D" fill="#EE813D"/>
                <span style={{ fontSize:12, fontWeight:700, color:"#EE813D", textTransform:"uppercase", letterSpacing:"0.08em" }}>À la une</span>
              </div>
              <h2 className="font-display" style={{ fontSize:28, fontWeight:800, color:"#10406B", letterSpacing:"-0.02em" }}>
                Offres en vedette
              </h2>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {[ChevronLeft, ChevronRight].map((Icon, i) => (
                <button key={i} onClick={() => scroll(i===0?"left":"right")} style={{
                  width:42, height:42, borderRadius:"50%",
                  background:"white", border:"1px solid rgba(16,64,107,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"all 0.18s",
                  boxShadow:"0 2px 8px rgba(16,64,107,0.06)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#10406B"; (e.currentTarget as HTMLElement).style.borderColor="#10406B"; (e.currentTarget.querySelector("svg") as SVGElement).style.color="white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; (e.currentTarget as HTMLElement).style.borderColor="rgba(16,64,107,0.12)"; (e.currentTarget.querySelector("svg") as SVGElement).style.color="#5A7A96"; }}
                >
                  <Icon size={18} color="#5A7A96"/>
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div ref={sliderRef} className="scroll-row" style={{ gap:16, padding:"16px 4px 24px", overflowY:"visible" }}>
            {featured.map(o => <JobCard key={o.id} offre={o} featured />)}
          </div>
          </div>
        </section>

      {/* ══ CATEGORY FILTERS + ALL JOBS ═══════════════════════════════ */}
      <section ref={resultsRef} style={{ padding:"0 0 56px", scrollMarginTop:80 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 48px" }}>
        {/* Category pills */}
        <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.filter;
            return (
              <button key={cat.label} 
                onClick={() => {
                  setCategory(cat.filter);
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
                  }, 100);
                }}
                style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"9px 18px", borderRadius:99, fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
                background: active ? "#10406B" : "white",
                color:      active ? "white" : "#5A7A96",
                border:     `1px solid ${active ? "#10406B" : "rgba(16,64,107,0.12)"}`,
                boxShadow:  active ? "0 4px 16px rgba(16,64,107,0.2)" : "0 1px 4px rgba(16,64,107,0.05)",
              }}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            );
          })}

          <div style={{ marginLeft:"auto", fontSize:13, color:"#5A7A96", alignSelf:"center", fontWeight:500 }}>
            <span style={{ color:"#10406B", fontWeight:700 }}>{filtered.length}</span> offre{filtered.length > 1?"s":""} trouvée{filtered.length > 1?"s":""}
          </div>
        </div>

        {/* Jobs grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div className="font-display" style={{ fontSize:22, fontWeight:700, color:"#10406B", marginBottom:8 }}>Aucune offre trouvée</div>
            <div style={{ color:"#5A7A96", fontSize:14 }}>Essayez d'autres mots-clés</div>
          </div>
        ) : (
          <div className="stagger-children" style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.map(o => (
              <div key={o.id} className="animate-fade-up">
                <JobCard offre={o}/>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* ══ COMPANY CAROUSEL ══════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(180deg, #FAFAF8 0%, white 100%)",
        padding: "56px 0 64px",
        borderTop: "1px solid rgba(16,64,107,0.07)",
        overflow: "hidden",
      }}>
        <div style={{ textAlign:"center", marginBottom:40, padding:"0 64px" }}>
          <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#5A7A96", marginBottom:10 }}>
            Ils nous font confiance
          </div>
          <h2 className="font-display" style={{ fontSize:28, fontWeight:800, color:"#10406B", letterSpacing:"-0.02em" }}>
            Entreprises partenaires
          </h2>
        </div>

        {/* Infinite scroll track */}
        <div style={{ overflow:"hidden", position:"relative" }}>
          {/* Fade edges */}
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:120, background:"linear-gradient(90deg, white, transparent)", zIndex:2, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:120, background:"linear-gradient(-90deg, white, transparent)", zIndex:2, pointerEvents:"none" }}/>

          <div className="carousel-track" style={{ gap:0 }}>
            {[...COMPANIES, ...COMPANIES].map((co, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"16px 40px",
                borderRight:"1px solid rgba(16,64,107,0.06)",
                flexShrink:0, cursor:"pointer",
                transition:"background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,64,107,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background: `${co.color}15`,
                  border: `1px solid ${co.color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:800, color:co.color,
                  fontFamily:"'Fraunces', serif",
                }}>{co.initial}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0D2137", whiteSpace:"nowrap" }}>{co.name}</div>
                  <div style={{ fontSize:11, color:"#5A7A96", display:"flex", alignItems:"center", gap:3, marginTop:1 }}>
                    <Globe size={10}/> {Math.floor(Math.random()*20+2)} offres actives
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign:"center", marginTop:48, padding:"0 64px" }}>
          <p style={{ color:"#5A7A96", fontSize:15, marginBottom:20 }}>
            Vous êtes une entreprise ? Publiez vos offres et trouvez les meilleurs talents.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button style={{
              padding:"13px 28px", borderRadius:99,
              background:"linear-gradient(135deg, #EE813D, #d4691f)",
              border:"none", color:"white", fontSize:14, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              boxShadow:"0 4px 20px rgba(238,129,61,0.35)",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <Zap size={15}/> Publier une offre
            </button>
            <button style={{
              padding:"13px 28px", borderRadius:99,
              background:"white", border:"1px solid rgba(16,64,107,0.15)",
              color:"#10406B", fontSize:14, fontWeight:600,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              boxShadow:"0 2px 8px rgba(16,64,107,0.06)",
            }}>
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer style={{
        background: "#10406B",
        padding: "40px 64px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:"linear-gradient(135deg, #EE813D, #2284C0)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span className="font-display" style={{ color:"white", fontSize:16, fontWeight:900 }}>N</span>
          </div>
          <span className="font-display" style={{ fontSize:18, fontWeight:800, color:"white" }}>nexus</span>
        </div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>
          © 2026 Nexus · La plateforme de recrutement de demain
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {["Confidentialité","CGU","Contact"].map(link => (
            <span key={link} style={{ fontSize:13, color:"rgba(255,255,255,0.45)", cursor:"pointer", fontWeight:500 }}>{link}</span>
          ))}
        </div>
      </footer>
    </AppShell>
  );
}