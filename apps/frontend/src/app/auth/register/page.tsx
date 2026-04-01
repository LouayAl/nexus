"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import toast from "react-hot-toast";

type Role = "CANDIDAT" | "ENTREPRISE";

export default function RegisterPage() {
  const { register } = useAuth();
  const [role,     setRole]     = useState<Role>("CANDIDAT");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [prenom,   setPrenom]   = useState("");
  const [nom,      setNom]      = useState("");
  const [company,  setCompany]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email, password, role,
        ...(role === "CANDIDAT"   ? { prenom, nom }            : {}),
        ...(role === "ENTREPRISE" ? { nomEntreprise: company }  : {}),
      });
      toast.success("Compte créé avec succès !");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"12px 16px", borderRadius:12,
    border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
    fontSize:14, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
    background:"#FAFAF8", transition:"all 0.18s", boxSizing:"border-box" as const,
  };

  const labelStyle = {
    display:"block" as const, fontSize:11, fontWeight:700,
    textTransform:"uppercase" as const, letterSpacing:"0.07em",
    color:"#5A7A96", marginBottom:8,
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#2284C0";
    e.target.style.background  = "white";
    e.target.style.boxShadow   = "0 0 0 3px rgba(34,132,192,0.08)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(16,64,107,0.12)";
    e.target.style.background  = "#FAFAF8";
    e.target.style.boxShadow   = "none";
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"2fr 1fr", fontFamily:"'DM Sans', sans-serif" }}>

      {/* ══ LEFT — Brand panel ══ */}
      <div style={{
        position:"relative", overflow:"hidden",
        background:"linear-gradient(145deg, #0B2E4E 0%, #10406B 40%, #1B6FA8 80%, #2284C0 100%)",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"48px 64px",
      }}>

        {/* Mesh */}
        <div style={{
          position:"absolute", inset:0, opacity:0.07,
          backgroundImage:`
            radial-gradient(ellipse at 20% 20%, #EE813D 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, #2284C0 0%, transparent 50%),
            radial-gradient(ellipse at 60% 10%, white 0%, transparent 40%)
          `,
        }}/>

        {/* Geometric arcs */}
        <div style={{ position:"absolute", top:0, right:0, width:300, height:300, opacity:0.06 }}>
          <svg viewBox="0 0 300 300" fill="none"><circle cx="300" cy="0" r="200" stroke="white" strokeWidth="1"/><circle cx="300" cy="0" r="150" stroke="white" strokeWidth="1"/><circle cx="300" cy="0" r="100" stroke="white" strokeWidth="1"/></svg>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, width:250, height:250, opacity:0.05 }}>
          <svg viewBox="0 0 250 250" fill="none"><circle cx="0" cy="250" r="180" stroke="white" strokeWidth="1"/><circle cx="0" cy="250" r="120" stroke="white" strokeWidth="1"/></svg>
        </div>

        {/* Orange blob */}
        <div style={{
          position:"absolute", top:"25%", right:"-8%",
          width:360, height:360, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(238,129,61,0.15) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>

        {/* Logo */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background:"linear-gradient(135deg, #EE813D, #d4691f)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 20px rgba(238,129,61,0.5)",
            }}>
              <span className="font-display" style={{ color:"white", fontSize:20, fontWeight:900, lineHeight:1 }}>N</span>
            </div>
            <span className="font-display" style={{ fontSize:24, fontWeight:900, color:"white", letterSpacing:"-0.03em" }}>nexus</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ position:"relative", zIndex:1, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 0" }}>

          <h1 className="font-display" style={{
            fontSize:"clamp(40px, 4vw, 56px)", fontWeight:900, color:"white",
            lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:20,
          }}>
            Rejoignez<br/>
            <span style={{
              color:"transparent",
              backgroundImage:"linear-gradient(90deg, #EE813D, #F5A761)",
              WebkitBackgroundClip:"text", backgroundClip:"text",
              fontStyle:"italic",
            }}>98 000+</span><br/>
            utilisateurs.
          </h1>

          <p style={{ fontSize:16, color:"rgba(255,255,255,0.6)", lineHeight:1.75, maxWidth:400, marginBottom:52 }}>
            Candidats et recruteurs confondus — Nexus connecte les meilleurs talents aux meilleures opportunités.
          </p>

          {/* Two cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:40 }}>
            {[
              { emoji:"👨‍💻", title:"Candidats", sub:"Trouvez votre prochain rôle parmi 12 000+ offres", color:"rgba(34,132,192,0.15)" },
              { emoji:"🏢", title:"Entreprises", sub:"Recrutez les meilleurs talents rapidement", color:"rgba(238,129,61,0.15)" },
            ].map((c, i) => (
              <div key={i} style={{
                background:c.color, backdropFilter:"blur(8px)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:16, padding:"18px 16px",
              }}>
                <div style={{ fontSize:26, marginBottom:8 }}>{c.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:24 }}>
            {[
              { val:"12K+", label:"Offres actives" },
              { val:"3.4K", label:"Entreprises" },
              { val:"89%", label:"Placement" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-display" style={{ fontSize:22, fontWeight:900, color:"white", lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:"relative", zIndex:1 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.04em" }}>
            Powered by <strong style={{ color:"rgba(255,255,255,0.5)" }}>S3M</strong>
          </span>
        </div>
      </div>

      {/* ══ RIGHT — Form panel ══ */}
      <div style={{
        background:"white", display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"40px 40px",
        overflowY:"auto",
      }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(238,129,61,0.08)", borderRadius:99, padding:"4px 12px", marginBottom:14, border:"1px solid rgba(238,129,61,0.15)" }}>
            <Sparkles size={12} color="#EE813D"/>
            <span style={{ fontSize:11, fontWeight:700, color:"#EE813D", letterSpacing:"0.06em", textTransform:"uppercase" }}>Inscription</span>
          </div>
          <h2 className="font-display" style={{ fontSize:26, fontWeight:900, color:"#0D2137", letterSpacing:"-0.02em", marginBottom:4, lineHeight:1.2 }}>
            Créer un compte
          </h2>
          <p style={{ fontSize:13, color:"#5A7A96" }}>Rejoignez Nexus et commencez votre parcours.</p>
        </div>

        {/* Role selector */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
          {([
            ["CANDIDAT", "👨‍💻", "Je cherche un emploi"],
            ["ENTREPRISE", "🏢", "Je recrute des talents"],
          ] as const).map(([r, emoji, sub]) => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              padding:"12px 14px", borderRadius:12, textAlign:"left",
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s",
              background: role===r ? "rgba(16,64,107,0.05)" : "#FAFAF8",
              border:`2px solid ${role===r ? "#10406B" : "rgba(16,64,107,0.1)"}`,
              boxShadow: role===r ? "0 2px 12px rgba(16,64,107,0.1)" : "none",
            }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{emoji}</div>
              <div style={{ fontWeight:700, fontSize:12, color:role===r?"#10406B":"#0D2137", marginBottom:2 }}>
                {r === "CANDIDAT" ? "Candidat" : "Entreprise"}
              </div>
              <div style={{ fontSize:10, color:"#5A7A96", lineHeight:1.4 }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* OAuth */}
        <OAuthButtons mode="register"/>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
          <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
          <span style={{ fontSize:11, color:"#B0C4D4", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>ou avec email</span>
          <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:13 }}>
          {role === "CANDIDAT" ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
              </div>
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Nom de l'entreprise</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="TechNova SAS" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
            </div>
          )}

          <div>
            <label style={labelStyle}>Adresse email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required style={inputStyle} onFocus={onFocus} onBlur={onBlur}/>
          </div>

          <div>
            <label style={labelStyle}>Mot de passe</label>
            <div style={{ position:"relative" }}>
              <input
                type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 caractères" required
                style={{ ...inputStyle, padding:"12px 44px 12px 16px" }}
                onFocus={onFocus} onBlur={onBlur}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", color:"#B0C4D4",
                display:"flex", alignItems:"center", padding:0,
              }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width:"100%", padding:"13px",
            background: loading ? "rgba(238,129,61,0.5)" : "linear-gradient(135deg, #EE813D, #d4691f)",
            border:"none", borderRadius:12, color:"white",
            fontSize:14, fontWeight:700, cursor:loading ? "not-allowed" : "pointer",
            fontFamily:"'DM Sans',sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow: loading ? "none" : "0 4px 20px rgba(238,129,61,0.35)",
            transition:"all 0.2s", marginTop:4,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
          >
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                Création…
              </span>
            ) : (
              <><span>Créer mon compte</span><ArrowRight size={15}/></>
            )}
          </button>
        </form>

        <p style={{ textAlign:"center", fontSize:13, color:"#5A7A96", marginTop:20 }}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" style={{ color:"#2284C0", fontWeight:700, textDecoration:"none" }}>
            Se connecter →
          </Link>
        </p>

        {/* Trust */}
        <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid rgba(16,64,107,0.06)", display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
          {["🔒 Sécurisé SSL", "🇫🇷 Données en France", "✓ RGPD"].map(b => (
            <span key={b} style={{ fontSize:10, color:"#B0C4D4", fontWeight:500 }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}