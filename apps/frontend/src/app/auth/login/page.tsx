"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, Lock } from "lucide-react";
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

  const iSx: React.CSSProperties = {
    width:"100%", padding:"12px 16px 12px 40px", borderRadius:12,
    border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
    fontSize:14, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
    background:"#FAFAF8", transition:"all 0.18s", boxSizing:"border-box",
  };
  const onF = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor="#2284C0";
    e.target.style.background="white";
    e.target.style.boxShadow="0 0 0 3px rgba(34,132,192,0.08)";
  };
  const onB = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor="rgba(16,64,107,0.12)";
    e.target.style.background="#FAFAF8";
    e.target.style.boxShadow="none";
  };

  return (
    <>
      <style>{`
        .login-layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 2fr 1fr;
          font-family: 'DM Sans', sans-serif;
        }
        .login-brand { display: flex !important; }
        .login-mobile-logo { display: none !important; }
        .login-form-panel {
          padding: 48px 40px;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .login-layout { grid-template-columns: 1fr; }
          .login-brand  { display: none !important; }
          .login-mobile-logo { display: flex !important; }
          .login-form-panel {
            padding: 32px 20px !important;
            justify-content: flex-start !important;
            padding-top: 40px !important;
          }
        }
      `}</style>

      <div className="login-layout">

        {/* ══ LEFT — Brand panel ══ */}
        <div className="login-brand" style={{
          position:"relative", overflow:"hidden",
          background:"linear-gradient(145deg, #0B2E4E 0%, #10406B 40%, #1B6FA8 80%, #2284C0 100%)",
          flexDirection:"column", justifyContent:"space-between",
          padding:"48px 64px",
        }}>
          <div style={{ position:"absolute", inset:0, opacity:0.07, backgroundImage:`radial-gradient(ellipse at 20% 20%, #EE813D 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #2284C0 0%, transparent 50%)` }}/>
          <div style={{ position:"absolute", top:0, right:0, width:300, height:300, opacity:0.06 }}>
            <svg viewBox="0 0 300 300" fill="none"><circle cx="300" cy="0" r="200" stroke="white" strokeWidth="1"/><circle cx="300" cy="0" r="150" stroke="white" strokeWidth="1"/><circle cx="300" cy="0" r="100" stroke="white" strokeWidth="1"/></svg>
          </div>
          <div style={{ position:"absolute", top:"30%", right:"-5%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(238,129,61,0.18) 0%, transparent 70%)", pointerEvents:"none" }}/>

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
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:99, padding:"6px 16px", marginBottom:40, width:"fit-content" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ADE80", boxShadow:"0 0 8px rgba(74,222,128,0.8)" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)", letterSpacing:"0.04em" }}>14 offres publiées aujourd'hui</span>
            </div>

            <h1 className="font-display" style={{ fontSize:"clamp(36px,4vw,58px)", fontWeight:900, color:"white", lineHeight:1.1, letterSpacing:"-0.03em", marginBottom:24 }}>
              Le futur du<br/>
              <span style={{ color:"transparent", backgroundImage:"linear-gradient(90deg, #EE813D, #F5A761)", WebkitBackgroundClip:"text", backgroundClip:"text", fontStyle:"italic" }}>recrutement</span><br/>
              commence ici.
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.6)", lineHeight:1.75, maxWidth:420, marginBottom:48 }}>
              Des milliers d'offres, des outils intelligents, et des entreprises de premier plan.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { icon:"⚡", text:"12 000+ offres actives en temps réel" },
                { icon:"🎯", text:"Matching intelligent par compétences" },
                { icon:"📊", text:"Suivi de candidatures en temps réel" },
              ].map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{f.icon}</div>
                  <span style={{ fontSize:14, color:"rgba(255,255,255,0.7)", fontWeight:500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div style={{ position:"relative", zIndex:1, background:"rgba(255,255,255,0.06)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"18px 22px" }}>
            <div style={{ display:"flex", gap:2, marginBottom:8 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color:"#EE813D", fontSize:12 }}>★</span>)}
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:12, fontStyle:"italic" }}>
              "J'ai trouvé mon poste de Data Engineer en moins de 2 semaines grâce à Nexus."
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg, #EE813D, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white", flexShrink:0 }}>M</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"white" }}>Mohamed A.</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>Data Engineer chez DataLab</div>
              </div>
            </div>
          </div>
          <div style={{ position:"relative", zIndex:1, marginTop:20 }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Powered by <strong style={{ color:"rgba(255,255,255,0.5)" }}>S3M</strong></span>
          </div>
        </div>

        {/* ══ RIGHT — Form ══ */}
        <div className="login-form-panel" style={{ background:"white", display:"flex", flexDirection:"column", overflowY:"auto" }}>

          {/* Mobile logo */}
          <div className="login-mobile-logo" style={{ alignItems:"center", gap:10, marginBottom:28 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg, #EE813D, #2284C0)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span className="font-display" style={{ color:"white", fontSize:16, fontWeight:900 }}>N</span>
            </div>
            <span className="font-display" style={{ fontSize:20, fontWeight:900, color:"#10406B", letterSpacing:"-0.02em" }}>nexus</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(238,129,61,0.08)", borderRadius:99, padding:"4px 12px", marginBottom:14, border:"1px solid rgba(238,129,61,0.15)" }}>
              <Sparkles size={12} color="#EE813D"/>
              <span style={{ fontSize:11, fontWeight:700, color:"#EE813D", letterSpacing:"0.06em", textTransform:"uppercase" }}>Bienvenue</span>
            </div>
            <h2 className="font-display" style={{ fontSize:"clamp(22px,4vw,28px)", fontWeight:900, color:"#0D2137", letterSpacing:"-0.02em", marginBottom:4 }}>Bon retour 👋</h2>
            <p style={{ fontSize:14, color:"#5A7A96" }}>Accédez à votre espace Nexus.</p>
          </div>

          <OAuthButtons mode="login"/>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
            <span style={{ fontSize:11, color:"#B0C4D4", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>ou</span>
            <div style={{ flex:1, height:1, background:"rgba(16,64,107,0.08)" }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>Adresse email</label>
              <div style={{ position:"relative" }}>
                <Mail size={14} color="#B0C4D4" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required style={iSx} onFocus={onF} onBlur={onB}/>
              </div>
            </div>

            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                <label style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>Mot de passe</label>
                <span style={{ fontSize:12, color:"#2284C0", cursor:"pointer", fontWeight:600 }}>Oublié ?</span>
              </div>
              <div style={{ position:"relative" }}>
                <Lock size={14} color="#B0C4D4" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input type={showPw?"text":"password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ ...iSx, paddingRight:44 }} onFocus={onF} onBlur={onB}/>
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#B0C4D4", display:"flex", alignItems:"center", padding:0 }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"13px",
              background: loading ? "rgba(16,64,107,0.5)" : "linear-gradient(135deg, #10406B 0%, #2284C0 100%)",
              border:"none", borderRadius:12, color:"white",
              fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer",
              fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow: loading?"none":"0 4px 20px rgba(16,64,107,0.3)",
              marginTop:4,
            }}>
              {loading
                ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>Connexion…</>
                : <><span>Se connecter</span><ArrowRight size={15}/></>
              }
            </button>
          </form>

          <p style={{ textAlign:"center", fontSize:13, color:"#5A7A96", marginTop:20 }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/register" style={{ color:"#EE813D", fontWeight:700, textDecoration:"none" }}>Créer un compte →</Link>
          </p>

          <div style={{ marginTop:24, paddingTop:18, borderTop:"1px solid rgba(16,64,107,0.06)", display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
            {["🔒 SSL", "🇫🇷 France", "✓ RGPD"].map(b => (
              <span key={b} style={{ fontSize:11, color:"#B0C4D4", fontWeight:500 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm/></Suspense>;
}