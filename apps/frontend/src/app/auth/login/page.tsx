// frontend/src/app/auth/login/page.tsx last version that i need to fix
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { BrandLogo } from "@/components/common/BrandLogo";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAppLanguage } from "@/hooks/useAppLanguage";

const COPY = {
  fr: {
    badge: "Bienvenue",
    title: "Bon retour",
    subtitle: "Accédez à votre espace candidat S3M.",
    email: "Adresse email",
    password: "Mot de passe",
    forgot: "Mot de passe oublié ?",
    login: "Se connecter",
    loggingIn: "Connexion...",
    noAccount: "Pas encore de compte ?",
    register: "Créer un compte",
    or: "ou",
    wrongCreds: "Email ou mot de passe incorrect.",
    heroEyebrow: "Espace candidat",
    heroTitleA: "L’excellence du",
    heroTitleB: "recrutement",
    heroTitleC: "commence ici.",
    heroText1: "Des opportunités sélectionnées, des outils intelligents, des entreprises leaders.",
    heroText2: "Créez votre espace, complétez votre profil et téléversez votre CV en quelques étapes.",
    feature1: "Complétez votre profil candidat",
    feature2: "Ajoutez vos expériences et compétences",
    feature3: "Téléversez votre CV",
  },
  en: {
    badge: "Welcome",
    title: "Welcome back",
    subtitle: "Access your S3M candidate space.",
    email: "Email address",
    password: "Password",
    forgot: "Forgot password?",
    login: "Sign in",
    loggingIn: "Signing in...",
    noAccount: "No account yet?",
    register: "Create an account",
    or: "or",
    wrongCreds: "Incorrect email or password.",
    heroEyebrow: "Candidate space",
    heroTitleA: "Redefining",
    heroTitleB: "recruitment",
    heroTitleC: "for what’s next.",
    heroText1: "Carefully selected opportunities, powerful tools, industry-leading companies.",
    heroText2: "Create your space, refine your profile, and upload your CV effortlessly.",
    feature1: "Complete your candidate profile",
    feature2: "Add your experience and skills",
    feature3: "Upload your resume",
  },
} as const;

function LoginForm() {
  const { login } = useAuth();
  const { language, setLanguage } = useAppLanguage();
  const copy = COPY[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, from);
    } catch (error: any) {
      toast.error(error?.message === "candidate_only" ? "Candidate access only." : copy.wrongCreds);
    } finally {
      setLoading(false);
    }
  };

  const iSx: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: 12,
    border: "1.5px solid rgba(16,64,107,0.12)",
    outline: "none",
    fontSize: 14,
    color: "#0D2137",
    fontFamily: "'DM Sans',sans-serif",
    background: "#FAFAF8",
    transition: "all 0.18s",
    boxSizing: "border-box",
  };

  const onF = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#2284C0";
    e.target.style.background = "white";
    e.target.style.boxShadow = "0 0 0 3px rgba(34,132,192,0.08)";
  };

  const onB = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(16,64,107,0.12)";
    e.target.style.background = "#FAFAF8";
    e.target.style.boxShadow = "none";
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
        <div className="login-brand" style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(145deg, #0B2E4E 0%, #10406B 40%, #1B6FA8 80%, #2284C0 100%)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 64px",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(ellipse at 20% 20%, #EE813D 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #2284C0 0%, transparent 50%)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <BrandLogo height={42} dark />
          </div>

          <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 16px", marginBottom: 40, width: "fit-content" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>{copy.heroEyebrow}</span>
            </div>

            <h1 className="font-display" style={{ fontSize: "clamp(36px,4vw,58px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 24 }}>
              {copy.heroTitleA}<br />
              <span style={{ color: "transparent", backgroundImage: "linear-gradient(90deg, #EE813D, #F5A761)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>{copy.heroTitleB}</span><br />
              {copy.heroTitleC}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 420, marginBottom: 20 }}>
              {copy.heroText1}
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 420, marginBottom: 48 }}>
              {copy.heroText2}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[copy.feature1, copy.feature2, copy.feature3].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                    {i === 0 ? "👤" : i === 1 ? "🧠" : "📄"}
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, marginTop: 20 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Powered by <strong style={{ color: "rgba(255,255,255,0.5)" }}>S3M</strong></span>
          </div>
        </div>

        <div className="login-form-panel" style={{ background: "white", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>

          <div className="login-mobile-logo" style={{ alignItems: "center", marginBottom: 28 }}>
            <BrandLogo height={34} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(238,129,61,0.08)", borderRadius: 99, padding: "4px 12px", marginBottom: 14, border: "1px solid rgba(238,129,61,0.15)" }}>
              <Sparkles size={12} color="#EE813D" />
              <span style={{ fontSize: 17, fontWeight: 800, color: "#EE813D", letterSpacing: "0.09em", textTransform: "uppercase" }}>{copy.badge}</span>
            </div>
            {/* <h2 className="font-display" style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 900, color: "#0D2137", marginBottom: 4 }}>{copy.title}</h2> */}
            <p style={{ fontSize: 14, color: "#5A7A96" }}>{copy.subtitle}</p>
          </div>

          <OAuthButtons mode="login" />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(16,64,107,0.08)" }} />
            <span style={{ fontSize: 11, color: "#B0C4D4", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{copy.or}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(16,64,107,0.08)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 7 }}>{copy.email}</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} color="#B0C4D4" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required style={iSx} onFocus={onF} onBlur={onB} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96" }}>{copy.password}</label>
                
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={14} color="#B0C4D4" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...iSx, paddingRight: 44 }} onFocus={onF} onBlur={onB} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#B0C4D4", display: "flex", alignItems: "center", padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%",
              padding: "13px",
              background: loading ? "rgba(16,64,107,0.5)" : "linear-gradient(135deg, #10406B 0%, #2284C0 100%)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: loading ? "none" : "0 4px 20px rgba(16,64,107,0.3)",
              marginTop: 4,
            }}>
              {loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{copy.loggingIn}</> : <><span>{copy.login}</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#5A7A96", marginTop: 20 }}>
            {copy.noAccount}{" "}
            <Link href="/auth/register" style={{ color: "#EE813D", fontWeight: 700, textDecoration: "none" }}>{copy.register} →</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
