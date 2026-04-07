"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, User, UserCircle  } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import toast from "react-hot-toast";

function LoginForm() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password, from); }
    catch { toast.error("Email ou mot de passe incorrect."); }
    finally { setLoading(false); }
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

        {/* Mesh background */}
        <div style={{
          position:"absolute", inset:0, opacity:0.07,
          backgroundImage:`
            radial-gradient(ellipse at 20% 20%, #EE813D 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, #2284C0 0%, transparent 50%),
            radial-gradient(ellipse at 60% 10%, white 0%, transparent 40%)
          `,
        }}/>

        {/* Geometric accent lines */}
        <div style={{ position:"absolute", top:0, right:0, width:300, height:300, opacity:0.06 }}>
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="0" r="200" stroke="white" strokeWidth="1"/>
            <circle cx="300" cy="0" r="150" stroke="white" strokeWidth="1"/>
            <circle cx="300" cy="0" r="100" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, width:250, height:250, opacity:0.05 }}>
          <svg viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="0" cy="250" r="180" stroke="white" strokeWidth="1"/>
            <circle cx="0" cy="250" r="120" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        {/* Orange accent blob */}
        <div style={{
          position:"absolute", top:"30%", right:"-5%",
          width:320, height:320, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(238,129,61,0.18) 0%, transparent 70%)",
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

          {/* Live badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:99, padding:"6px 16px", marginBottom:40,
            width:"fit-content",
          }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80", boxShadow:"0 0 8px rgba(74,222,128,0.8)", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)", letterSpacing:"0.04em" }}>
              14 offres publiées aujourd'hui
            </span>
          </div>

          <h1 className="font-display" style={{
            fontSize:"clamp(40px, 4vw, 58px)", fontWeight:900, color:"white",
            lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:24,
          }}>
            Le futur du<br/>
            <span style={{
              color:"transparent",
              backgroundImage:"linear-gradient(90deg, #EE813D, #F5A761)",
              WebkitBackgroundClip:"text", backgroundClip:"text",
              fontStyle:"italic",
            }}>recrutement</span><br/>
            commence ici.
          </h1>

          <p style={{ fontSize:17, color:"rgba(255,255,255,0.6)", lineHeight:1.75, maxWidth:420, marginBottom:56 }}>
            Des milliers d'offres, des outils intelligents, et des entreprises de premier plan — tout en un seul endroit.
          </p>

          {/* Feature list */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { icon:"⚡", text:"12 000+ offres actives en temps réel" },
              { icon:"🎯", text:"Matching intelligent par compétences" },
              { icon:"📊", text:"Suivi de candidatures en temps réel" },
            ].map((f, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:"rgba(255,255,255,0.08)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div style={{
          position:"relative", zIndex:1,
          background:"rgba(255,255,255,0.06)",
          backdropFilter:"blur(12px)",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:20, padding:"20px 24px",
        }}>
          <div style={{ display:"flex", gap:3, marginBottom:10 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color:"#EE813D", fontSize:13 }}>★</span>
            ))}
          </div>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:12, fontStyle:"italic" }}>
            "J'ai trouvé mon poste de Data Engineer en moins de 2 semaines grâce à Nexus. L'interface est incroyable."
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:"linear-gradient(135deg, #EE813D, #2284C0)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, fontWeight:700, color:"white",
            }}>M</div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"white" }}>Mohamed A.</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>Data Engineer chez DataLab</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position:"relative", zIndex:1, marginTop:24 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.04em" }}>
            Powered by <strong style={{ color:"rgba(255,255,255,0.5)" }}>S3M</strong>
          </span>
        </div>
      </div>

      {/* ══ RIGHT — Form panel ══ */}
      <div style={{
        background:"white", display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"48px 40px",
        overflowY:"auto",
      }}>

        {/* Header */}
        <div style={{ marginBottom:32, textAlign: "center" }}>

          {/* Avatar */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #F4F6F9, #E9EEF5)",
              border: "1px solid rgba(16,64,107,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px auto",
              boxShadow: "0 6px 18px rgba(16,64,107,0.08)"
            }}
          >
            <UserCircle size={80} color="#B0C4D4" />
          </div>

          <div
            style={{
              display:"inline-flex",
              alignItems:"center",
              gap:6,
              background:"rgba(238,129,61,0.08)",
              borderRadius:99,
              padding:"4px 12px",
              marginBottom:16,
              border:"1px solid rgba(238,129,61,0.15)"
            }}
          >
            <Sparkles size={12} color="#EE813D"/>
            <span
              style={{
                fontSize:11,
                fontWeight:700,
                color:"#EE813D",
                letterSpacing:"0.06em",
                textTransform:"uppercase"
              }}
            >
              Bienvenue
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize:28, fontWeight:900, color:"#0D2137", letterSpacing:"-0.02em", marginBottom:6, lineHeight:1.2 }}>
            Bienvenue
          </h2>
          <p style={{ fontSize:14, color:"#5A7A96", lineHeight:1.6 }}>
            Accédez à votre espace Nexus.
          </p>
        </div>

        {/* OAuth */}
        <OAuthButtons mode="login"/>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
          <span style={{ fontSize:11, color:"#B0C4D4", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>ou</span>
          <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#5A7A96",
                marginBottom: 8,
              }}
            >
              Adresse email
            </label>

            <div style={{ position: "relative" }}>
              <User
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#B0C4D4",
                  pointerEvents: "none",
                }}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px", // space for icon
                  borderRadius: 12,
                  border: "1.5px solid rgba(16,64,107,0.12)",
                  outline: "none",
                  fontSize: 14,
                  color: "#0D2137",
                  fontFamily: "'DM Sans',sans-serif",
                  background: "#FAFAF8",
                  transition: "all 0.18s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2284C0";
                  e.target.style.background = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(34,132,192,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(16,64,107,0.12)";
                  e.target.style.background = "#FAFAF8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <label style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>
                Mot de passe
              </label>
              <span style={{ fontSize:12, color:"#2284C0", cursor:"pointer", fontWeight:600 }}>Oublié ?</span>
            </div>
            <div style={{ position:"relative" }}>
              <input
                type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width:"100%", padding:"12px 44px 12px 16px", borderRadius:12,
                  border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
                  fontSize:14, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
                  background:"#FAFAF8", transition:"all 0.18s", boxSizing:"border-box",
                }}
                onFocus={e => { e.target.style.borderColor="#2284C0"; e.target.style.background="white"; e.target.style.boxShadow="0 0 0 3px rgba(34,132,192,0.08)"; }}
                onBlur={e  => { e.target.style.borderColor="rgba(16,64,107,0.12)"; e.target.style.background="#FAFAF8"; e.target.style.boxShadow="none"; }}
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
            background: loading ? "rgba(16,64,107,0.5)" : "linear-gradient(135deg, #10406B 0%, #2284C0 100%)",
            border:"none", borderRadius:12, color:"white",
            fontSize:14, fontWeight:700, cursor:loading ? "not-allowed" : "pointer",
            fontFamily:"'DM Sans',sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow: loading ? "none" : "0 4px 20px rgba(16,64,107,0.3)",
            transition:"all 0.2s", marginTop:4,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
          >
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                Connexion…
              </span>
            ) : (
              <><span>Se connecter</span><ArrowRight size={15}/></>
            )}
          </button>
        </form>

        <p style={{ textAlign:"center", fontSize:13, color:"#5A7A96", marginTop:24 }}>
          Pas encore de compte ?{" "}
          <Link href="/auth/register" style={{ color:"#EE813D", fontWeight:700, textDecoration:"none" }}>
            Créer un compte →
          </Link>
        </p>

        {/* Trust badges */}
        <div style={{ marginTop:32, paddingTop:24, borderTop:"1px solid rgba(16,64,107,0.06)", display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          {["🔒 Sécurisé SSL", "🇫🇷 Données en France", "✓ RGPD conforme"].map(b => (
            <span key={b} style={{ fontSize:11, color:"#B0C4D4", fontWeight:500 }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm/></Suspense>;
}