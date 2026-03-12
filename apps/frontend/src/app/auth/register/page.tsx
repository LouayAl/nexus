"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { authApi, setToken } from "@/lib/api";
import { theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Role = "CANDIDAT" | "ENTREPRISE";

export default function RegisterPage() {
  const router  = useRouter();
  const [role,     setRole]     = useState<Role>("CANDIDAT");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [prenom,   setPrenom]   = useState("");
  const [nom,      setNom]      = useState("");
  const [company,  setCompany]  = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register({
        email, password, role,
        ...(role === "CANDIDAT"   ? { prenom, nom }           : {}),
        ...(role === "ENTREPRISE" ? { nomEntreprise: company } : {}),
      });
      setToken(data.access_token);
      toast.success("Compte créé avec succès !");
      router.push(role === "ENTREPRISE" ? "/company/dashboard" : "/discover");
    } catch {
      toast.error("Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, value: string, onChange: (v:string)=>void, Icon: React.ElementType, type="text", placeholder="") => (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ color:theme.textSub, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 14px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
        <Icon size={15} color={theme.textSub}/>
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required
          style={{ background:"none", border:"none", outline:"none", color:theme.text, fontSize:13, padding:"11px 0", flex:1, fontFamily:"'Outfit',sans-serif" }}/>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:460 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div className="font-syne" style={{ fontWeight:800, fontSize:32, color:theme.text, display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginBottom:8 }}>
            <span style={{ color:theme.primary, fontSize:36 }}>⬡</span> NEXUS
          </div>
          <div style={{ fontSize:14, color:theme.textSub }}>Créez votre compte</div>
        </div>

        <div className="glass-card" style={{ padding:36 }}>
          <div className="font-syne" style={{ fontWeight:700, fontSize:22, color:theme.text, marginBottom:24 }}>Inscription</div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {/* Role picker */}
            <div>
              <div style={{ color:theme.textSub, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Je suis…</div>
              <div style={{ display:"flex", gap:12 }}>
                {(["CANDIDAT","ENTREPRISE"] as Role[]).map((r) => {
                  const Icon = r==="CANDIDAT" ? User : Building2;
                  const label = r==="CANDIDAT" ? "Candidat" : "Entreprise";
                  const sub   = r==="CANDIDAT" ? "Je cherche un emploi" : "Je recrute des talents";
                  return (
                    <button type="button" key={r} onClick={()=>setRole(r)} style={{
                      flex:1, padding:16, borderRadius:12, textAlign:"left", cursor:"pointer",
                      fontFamily:"'Outfit',sans-serif", transition:"all 0.2s",
                      background: role===r ? theme.primaryDim : "rgba(255,255,255,0.03)",
                      border: `1px solid ${role===r ? theme.primary+"60" : "rgba(255,255,255,0.07)"}`,
                    }}>
                      <Icon size={20} color={role===r ? theme.primary : theme.textSub}/>
                      <div style={{ fontWeight:700, fontSize:13, marginTop:8, marginBottom:2, color:role===r?theme.primary:theme.text }}>{label}</div>
                      <div style={{ fontSize:11, color:theme.textSub }}>{sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height:1, background:theme.cardBorder }}/>

            {role === "CANDIDAT" ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {field("Prénom", prenom, setPrenom, User, "text", "Jean")}
                {field("Nom",   nom,    setNom,    User, "text", "Dupont")}
              </div>
            ) : (
              field("Nom de l'entreprise", company, setCompany, Building2, "text", "TechNova SAS")
            )}

            {field("Email",        email,    setEmail,    Mail, "email",    "vous@exemple.com")}
            {field("Mot de passe", password, setPassword, Lock, "password", "••••••••")}

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"12px", borderRadius:10, fontWeight:700, fontSize:14,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              background:`linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              border:"none", color:"white", cursor:loading?"not-allowed":"pointer",
              fontFamily:"'Outfit',sans-serif", opacity:loading?0.7:1,
            }}>
              {loading ? "Création…" : <><span>Créer mon compte</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <div style={{ textAlign:"center", fontSize:13, color:theme.textSub, marginTop:20 }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color:theme.primary, fontWeight:600, textDecoration:"none" }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}