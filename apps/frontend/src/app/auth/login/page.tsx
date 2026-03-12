"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { theme } from "@/lib/theme";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      toast.error("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div className="font-syne" style={{ fontWeight:800, fontSize:32, color:theme.text, display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:8 }}>
            <span style={{ color:theme.primary, fontSize:36 }}>⬡</span> NEXUS
          </div>
          <div style={{ fontSize:14, color:theme.textSub }}>Le futur du recrutement</div>
        </div>

        <div className="glass-card" style={{ padding:36 }}>
          <div className="font-syne" style={{ fontWeight:700, fontSize:22, color:theme.text, marginBottom:4 }}>Connexion</div>
          <div style={{ fontSize:13, color:theme.textSub, marginBottom:28 }}>Bon retour sur NEXUS !</div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {/* Email */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ color:theme.textSub, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Email</label>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <Mail size={15} color={theme.textSub}/>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" required
                  style={{ background:"none", border:"none", outline:"none", color:theme.text, fontSize:13, padding:"11px 0", flex:1, fontFamily:"'Outfit',sans-serif" }}/>
              </div>
            </div>

            {/* Password */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ color:theme.textSub, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Mot de passe</label>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <Lock size={15} color={theme.textSub}/>
                <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ background:"none", border:"none", outline:"none", color:theme.text, fontSize:13, padding:"11px 0", flex:1, fontFamily:"'Outfit',sans-serif" }}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ background:"none", border:"none", cursor:"pointer", color:theme.textSub, display:"flex" }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"12px", borderRadius:10, fontWeight:700, fontSize:14,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              background:`linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              border:"none", color:"white", cursor:loading?"not-allowed":"pointer",
              fontFamily:"'Outfit',sans-serif", opacity:loading?0.7:1, transition:"all 0.2s",
            }}>
              {loading ? "Connexion…" : <><span>Se connecter</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:theme.cardBorder }}/>
            <span style={{ fontSize:12, color:theme.textFaint }}>ou</span>
            <div style={{ flex:1, height:1, background:theme.cardBorder }}/>
          </div>

          <div style={{ textAlign:"center", fontSize:13, color:theme.textSub }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/register" style={{ color:theme.primary, fontWeight:600, textDecoration:"none" }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}