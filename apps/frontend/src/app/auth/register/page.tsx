// frontend/src/app/auth/register/page.tsx last version that i need to fix
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useAuth } from "@/hooks/useAuth";

const COPY = {
  fr: {
    badge: "Inscription",
    title: "Créer un compte candidat",
    subtitle: "Rejoignez Nexus et complétez votre profil candidat.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse email",
    password: "Mot de passe",
    create: "Créer mon compte",
    creating: "Création...",
    already: "Déjà un compte ?",
    login: "Se connecter",
    success: "Compte créé avec succès !",
    failure: "Erreur lors de la création du compte.",
    heroEyebrow: "Parcours candidat",
    heroTitleA: "Préparez votre",
    heroTitleB: "candidature",
    heroTitleC: "simplement.",
    heroText: "Créez votre espace, ajoutez vos informations, puis téléversez votre CV pour finaliser votre profil.",
    feature1: "Inscription rapide",
    feature2: "Profil candidat complet",
    feature3: "CV prêt à envoyer",
    or: "ou avec email",
  },
  en: {
    badge: "Sign up",
    title: "Create a candidate account",
    subtitle: "Join Nexus and complete your candidate profile.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    password: "Password",
    create: "Create my account",
    creating: "Creating...",
    already: "Already have an account?",
    login: "Sign in",
    success: "Account created successfully!",
    failure: "There was an error creating your account.",
    heroEyebrow: "Candidate journey",
    heroTitleA: "Prepare your",
    heroTitleB: "application",
    heroTitleC: "with ease.",
    heroText: "Create your space, add your information, then upload your resume to complete your profile.",
    feature1: "Fast registration",
    feature2: "Complete candidate profile",
    feature3: "Resume ready to upload",
    or: "or with email",
  },
} as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const { language, setLanguage } = useAppLanguage();
  const copy = COPY[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email,
        password,
        role: "CANDIDAT",
        prenom,
        nom,
      });
      toast.success(copy.success);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? copy.failure);
    } finally {
      setLoading(false);
    }
  };

  const iSx: React.CSSProperties = {
    width: "100%",
    padding: "11px 16px 11px 40px",
    borderRadius: 11,
    border: "1.5px solid rgba(16,64,107,0.12)",
    outline: "none",
    fontSize: 13,
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
        <div className="register-brand" style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(145deg, #0B2E4E 0%, #10406B 40%, #1B6FA8 80%, #2284C0 100%)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 64px",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(ellipse at 20% 20%, #EE813D 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #2284C0 0%, transparent 50%)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #EE813D, #d4691f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(238,129,61,0.5)" }}>
                <span className="font-display" style={{ color: "white", fontSize: 20, fontWeight: 900 }}>N</span>
              </div>
              <span className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>nexus</span>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 16px", marginBottom: 40, width: "fit-content" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>{copy.heroEyebrow}</span>
            </div>

            <h1 className="font-display" style={{ fontSize: "clamp(36px,4vw,56px)", fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
              {copy.heroTitleA}<br />
              <span style={{ color: "transparent", backgroundImage: "linear-gradient(90deg, #EE813D, #F5A761)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>{copy.heroTitleB}</span><br />
              {copy.heroTitleC}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 400, marginBottom: 48 }}>
              {copy.heroText}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[copy.feature1, copy.feature2, copy.feature3].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                    {i === 0 ? "✨" : i === 1 ? "👤" : "📄"}
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Powered by <strong style={{ color: "rgba(255,255,255,0.5)" }}>S3M</strong></span>
          </div>
        </div>

        <div className="register-form-panel" style={{ background: "white", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>

          <div className="register-mobile-logo" style={{ alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #EE813D, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="font-display" style={{ color: "white", fontSize: 16, fontWeight: 900 }}>N</span>
            </div>
            <span className="font-display" style={{ fontSize: 20, fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em" }}>nexus</span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(238,129,61,0.08)", borderRadius: 99, padding: "4px 12px", marginBottom: 12, border: "1px solid rgba(238,129,61,0.15)" }}>
              <Sparkles size={12} color="#EE813D" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#EE813D", letterSpacing: "0.06em", textTransform: "uppercase" }}>{copy.badge}</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 900, color: "#0D2137", letterSpacing: "-0.02em", marginBottom: 4 }}>{copy.title}</h2>
            <p style={{ fontSize: 13, color: "#5A7A96" }}>{copy.subtitle}</p>
          </div>

          <OAuthButtons mode="register" />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(16,64,107,0.08)" }} />
            <span style={{ fontSize: 11, color: "#B0C4D4", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{copy.or}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(16,64,107,0.08)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 6 }}>{copy.firstName}</label>
                <div style={{ position: "relative" }}>
                  <User size={13} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input style={iSx} value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" required onFocus={onF} onBlur={onB} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase",  color: "#5A7A96", marginBottom: 6 }}>{copy.lastName}</label>
                <div style={{ position: "relative" }}>
                  <User size={13} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input style={iSx} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom de famille" required onFocus={onF} onBlur={onB} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 6 }}>{copy.email}</label>
              <div style={{ position: "relative" }}>
                <Mail size={13} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type="email" style={iSx} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required onFocus={onF} onBlur={onB} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 6 }}>{copy.password}</label>
              <div style={{ position: "relative" }}>
                <Lock size={13} color="#B0C4D4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input type={showPw ? "text" : "password"} style={{ ...iSx, paddingRight: 40 }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères" required onFocus={onF} onBlur={onB} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#B0C4D4", display: "flex", alignItems: "center", padding: 0 }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%",
              padding: "13px",
              background: loading ? "rgba(238,129,61,0.5)" : "linear-gradient(135deg, #EE813D, #d4691f)",
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
              boxShadow: loading ? "none" : "0 4px 20px rgba(238,129,61,0.35)",
              marginTop: 4,
            }}>
              {loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{copy.creating}</> : <><span>{copy.create}</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#5A7A96", marginTop: 16 }}>
            {copy.already}{" "}
            <Link href="/auth/login" style={{ color: "#2284C0", fontWeight: 700, textDecoration: "none" }}>{copy.login} →</Link>
          </p>
        </div>
      </div>
    </>
  );
}
