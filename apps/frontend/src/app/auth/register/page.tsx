"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock, Building2, User } from "lucide-react";
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

  const iSx: React.CSSProperties = {
    width:"100%", padding:"11px 16px 11px 40px", borderRadius:11,
    border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
    fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
    background:"#FAFAF8", transition:"all 0.18s", boxSizing:"border-box",
  };
  const onF = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor="#2284C0"; e.target.style.background="white"; e.target.style.boxShadow="0 0 0 3px rgba(34,132,192,0.08)"; };
  const onB = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor="rgba(16,64,107,0.12)"; e.target.style.background="#FAFAF8"; e.target.style.boxShadow="none"; };

  return (
    <>
      <style>{`
        .register-layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 2fr 1fr;
          font-family: 'DM Sans', sans-serif;
        }
        .register-brand { display: flex !important; }
        .register-mobile-logo { display: none !important; }
        .register-form-panel {
          padding: 40px;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .register-layout { grid-template-columns: 1fr; }
          .register-brand  { display: none !important; }
          .register-mobile-logo { display: flex !important; }
          .register-form-panel {
            padding: 32px 20px !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>

      <div className="register-layout">

        {/* ══ LEFT — Brand panel ══ */}
        <div className="register-brand" style={{
          position:"relative", overflow:"hidden",
          background:"linear-gradient(145deg, #0B2E4E 0%, #10406B 40%, #1B6FA8 80%, #2284C0 100%)",
          flexDirection:"column", justifyContent:"space-between",
          padding:"48px 64px",
        }}>
          <div style={{ position:"absolute", inset:0, opacity:0.07, backgroundImage:`radial-gradient(ellipse at 20% 20%, #EE813D 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #2284C0 0%, transparent 50%)` }}/>
          <div style={{ position:"absolute", top:0, right:0, width:300, height:300, opacity:0.06 }}>
            <svg viewBox="0 0 300 300" fill="none"><circle cx="300" cy="0" r="200" stroke="white" strokeWidth="1"/><circle cx="300" cy="0" r="150" stroke="white" strokeWidth="1"/></svg>
          </div>
          <div style={{ position:"absolute", top:"25%", right:"-8%", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(238,129,61,0.15) 0%, transparent 70%)", pointerEvents:"none" }}/>

          {/* Logo */}
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg, #EE813D, #d4691f)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(238,129,61,0.5)" }}>
                <span className="font-display" style={{ color:"white", fontSize:20, fontWeight:900 }}>N</span>
              </div>
              <span className="font-display" style={{ fontSize:24, fontWeight:900, color:"white", letterSpacing:"-0.03em" }}>nexus</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ position:"relative", zIndex:1, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 0" }}>
            <h1 className="font-display" style={{ fontSize:"clamp(36px,4vw,56px)", fontWeight:900, color:"white", lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:20 }}>
              Rejoignez<br/>
              <span style={{ color:"transparent", backgroundImage:"linear-gradient(90deg, #EE813D, #F5A761)", WebkitBackgroundClip:"text", backgroundClip:"text", fontStyle:"italic" }}>98 000+</span><br/>
              utilisateurs.
            </h1>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.6)", lineHeight:1.75, maxWidth:400, marginBottom:48 }}>
              Candidats et recruteurs — Nexus connecte les meilleurs talents aux meilleures opportunités.
            </p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:36 }}>
              {[
                { emoji:"👨‍💻", title:"Candidats",   sub:"Trouvez votre prochain rôle parmi 12 000+ offres",  color:"rgba(34,132,192,0.15)" },
                { emoji:"🏢",   title:"Entreprises", sub:"Recrutez les meilleurs talents rapidement",         color:"rgba(238,129,61,0.15)"  },
              ].map((c, i) => (
                <div key={i} style={{ background:c.color, backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"16px" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{c.emoji}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:4 }}>{c.title}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:20 }}>
              {[["12K+","Offres"],["3.4K","Entreprises"],["89%","Placement"]].map(([v,l]) => (
                <div key={l}>
                  <div className="font-display" style={{ fontSize:22, fontWeight:900, color:"white" }}>{v}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:"relative", zIndex:1 }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Powered by <strong style={{ color:"rgba(255,255,255,0.5)" }}>S3M</strong></span>
          </div>
        </div>

        {/* ══ RIGHT — Form ══ */}
        <div className="register-form-panel" style={{ background:"white", display:"flex", flexDirection:"column", overflowY:"auto" }}>

          {/* Mobile logo */}
          <div className="register-mobile-logo" style={{ alignItems:"center", gap:10, marginBottom:24 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg, #EE813D, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span className="font-display" style={{ color:"white", fontSize:16, fontWeight:900 }}>N</span>
            </div>
            <span className="font-display" style={{ fontSize:20, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>nexus</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(238,129,61,0.08)", borderRadius:99, padding:"4px 12px", marginBottom:12, border:"1px solid rgba(238,129,61,0.15)" }}>
              <Sparkles size={12} color="#EE813D"/>
              <span style={{ fontSize:11, fontWeight:700, color:"#EE813D", letterSpacing:"0.06em", textTransform:"uppercase" }}>Inscription</span>
            </div>
            <h2 className="font-display" style={{ fontSize:"clamp(20px,4vw,26px)", fontWeight:900, color:"#0D2137", letterSpacing:"-0.02em", marginBottom:4 }}>Créer un compte</h2>
            <p style={{ fontSize:13, color:"#5A7A96" }}>Rejoignez Nexus et commencez votre parcours.</p>
          </div>

          {/* Role selector */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
            {([["CANDIDAT","👨‍💻","Je cherche un emploi"],["ENTREPRISE","🏢","Je recrute"]] as const).map(([r, emoji, sub]) => (
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

          <OAuthButtons mode="register"/>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"14px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
            <span style={{ fontSize:11, color:"#B0C4D4", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>ou avec email</span>
            <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {role === "CANDIDAT" ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>Prénom</label>
                  <div style={{ position:"relative" }}>
                    <User size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <input style={iSx} value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" required onFocus={onF} onBlur={onB}/>
                  </div>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>Nom</label>
                  <div style={{ position:"relative" }}>
                    <User size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <input style={iSx} value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" required onFocus={onF} onBlur={onB}/>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>Nom de l'entreprise</label>
                <div style={{ position:"relative" }}>
                  <Building2 size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                  <input style={iSx} value={company} onChange={e => setCompany(e.target.value)} placeholder="TechNova SAS" required onFocus={onF} onBlur={onB}/>
                </div>
              </div>
            )}

            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>Adresse email</label>
              <div style={{ position:"relative" }}>
                <Mail size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input type="email" style={iSx} value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required onFocus={onF} onBlur={onB}/>
              </div>
            </div>

            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <Lock size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input type={showPw?"text":"password"} style={{ ...iSx, paddingRight:40 }} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" required onFocus={onF} onBlur={onB}/>
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#B0C4D4", display:"flex", alignItems:"center", padding:0 }}>
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"13px",
              background: loading ? "rgba(238,129,61,0.5)" : "linear-gradient(135deg, #EE813D, #d4691f)",
              border:"none", borderRadius:12, color:"white",
              fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer",
              fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow: loading?"none":"0 4px 20px rgba(238,129,61,0.35)",
              marginTop:4,
            }}>
              {loading
                ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>Création…</>
                : <><span>Créer mon compte</span><ArrowRight size={15}/></>
              }
            </button>
          </form>

          <p style={{ textAlign:"center", fontSize:13, color:"#5A7A96", marginTop:16 }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color:"#2284C0", fontWeight:700, textDecoration:"none" }}>Se connecter →</Link>
          </p>

          <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(16,64,107,0.06)", display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
            {["🔒 SSL", "🇫🇷 France", "✓ RGPD"].map(b => (
              <span key={b} style={{ fontSize:10, color:"#B0C4D4", fontWeight:500 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}