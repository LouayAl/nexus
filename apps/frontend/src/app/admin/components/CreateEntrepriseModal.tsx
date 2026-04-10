"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, Lock, MapPin, Globe, Tag, Copy, Send, CheckCircle, Loader2 } from "lucide-react";
import { adminApi, authApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { Field, inputStyle } from "./Field";

const SECTEURS = [
  "Tech & Logiciel","Data & IA","Cloud & DevOps","Cybersécurité",
  "Design & Produit","Marketing & Growth","Finance & Fintech",
  "MedTech & Santé","GreenTech","E-commerce","Conseil","Autre",
];

interface Props { onClose: () => void; }

export function CreateEntrepriseModal({ onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ nomEntreprise:"", email:"", password:"", secteur:"", localisation:"", siteWeb:"", description:"" });
  const [created, setCreated] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [sending, setSending] = useState(false);

  const mut = useMutation({
    mutationFn: () => adminApi.createEntreprise({ email:form.email, password:form.password, nomEntreprise:form.nomEntreprise }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:["admin-entreprises"] });
      setCreated(true);
      toast.success(`Entreprise "${form.nomEntreprise}" créée !`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? "Erreur lors de la création");
    },
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]:e.target.value }));

  const credentialsText = `Identifiants Nexus — ${form.nomEntreprise}\n\nEmail : ${form.email}\nMot de passe temporaire : ${form.password}\n\nConnectez-vous sur : ${process.env.NEXT_PUBLIC_API_URL?.replace("/api","") ?? "http://localhost:3000"}/auth/login\n\n⚠️ Changez votre mot de passe dès votre première connexion.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(credentialsText);
    setCopied(true);
    toast.success("Identifiants copiés !");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await authApi.sendCredentials({ email:form.email, password:form.password, nom:form.nomEntreprise, role:"ENTREPRISE" });
      toast.success("Email envoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal title="Créer une entreprise" onClose={onClose}>
      {!created ? (
        <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
          <div style={{ background:"rgba(238,129,61,0.06)", border:"1px solid rgba(238,129,61,0.15)", borderRadius:12, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#EE813D", display:"flex", gap:8, alignItems:"center" }}>
            <Building2 size={13}/> Le recruteur pourra se connecter et compléter le profil entreprise.
          </div>

          <Field label="Nom de l'entreprise">
            <div style={{ position:"relative" }}>
              <Building2 size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input style={{ ...inputStyle, paddingLeft:34 }} value={form.nomEntreprise} onChange={set("nomEntreprise")} placeholder="TechNova SAS" required/>
            </div>
          </Field>

          <Field label="Email de connexion">
            <div style={{ position:"relative" }}>
              <Mail size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input type="email" style={{ ...inputStyle, paddingLeft:34 }} value={form.email} onChange={set("email")} placeholder="contact@technova.com" required/>
            </div>
          </Field>

          <Field label="Mot de passe temporaire">
            <div style={{ position:"relative" }}>
              <Lock size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input type="text" style={{ ...inputStyle, paddingLeft:34 }} value={form.password} onChange={set("password")} placeholder="Ex: Nexus2026!" required minLength={6}/>
            </div>
            <div style={{ fontSize:11, color:"#B0C4D4", marginTop:5 }}>Mot de passe mémorable à communiquer au recruteur</div>
          </Field>

          <div style={{ borderTop:"1px solid rgba(16,64,107,0.07)", paddingTop:14, marginBottom:4 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#B0C4D4", marginBottom:12 }}>Optionnel</div>
          </div>

          <Field label="Secteur d'activité">
            <div style={{ position:"relative" }}>
              <Tag size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }}/>
              <select style={{ ...inputStyle, paddingLeft:34, cursor:"pointer" }} value={form.secteur} onChange={set("secteur")}>
                <option value="">— Sélectionner —</option>
                {SECTEURS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Field>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Localisation">
              <div style={{ position:"relative" }}>
                <MapPin size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input style={{ ...inputStyle, paddingLeft:34 }} value={form.localisation} onChange={set("localisation")} placeholder="Paris, France"/>
              </div>
            </Field>
            <Field label="Site web">
              <div style={{ position:"relative" }}>
                <Globe size={13} color="#B0C4D4" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input style={{ ...inputStyle, paddingLeft:34 }} value={form.siteWeb} onChange={set("siteWeb")} placeholder="https://…"/>
              </div>
            </Field>
          </div>

          <Field label="Description">
            <textarea style={{ ...inputStyle, minHeight:72, resize:"vertical", paddingLeft:14 } as any} value={form.description} onChange={set("description")} placeholder="Mission, valeurs…"/>
          </Field>

          <button type="submit" disabled={mut.isPending} style={{ width:"100%", padding:"13px", marginTop:4, background:mut.isPending?"rgba(238,129,61,0.4)":"linear-gradient(135deg,#EE813D,#d4691f)", border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:700, cursor:mut.isPending?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:mut.isPending?"none":"0 4px 20px rgba(238,129,61,0.3)" }}>
            {mut.isPending ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> Création…</> : <><Building2 size={14}/> Créer l'entreprise</>}
          </button>
        </form>
      ) : (
        /* ── Success state ── */
        <div>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(238,129,61,0.1)", border:"2px solid #EE813D", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
              <CheckCircle size={26} color="#EE813D"/>
            </div>
            <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137", marginBottom:4 }}>Entreprise créée !</div>
            <div style={{ fontSize:13, color:"#5A7A96" }}>Partagez ces identifiants avec {form.nomEntreprise}</div>
          </div>

          {/* Credentials card */}
          <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.1)", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:14 }}>Identifiants de connexion</div>
            {[
              { label:"Entreprise",       value:form.nomEntreprise },
              { label:"Email",            value:form.email         },
              { label:"Mot de passe",     value:form.password      },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(16,64,107,0.06)" }}>
                <span style={{ fontSize:12, color:"#5A7A96" }}>{label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#0D2137", fontFamily: label==="Mot de passe" ? "monospace" : "inherit" }}>{value}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}>
              <span style={{ fontSize:12, color:"#5A7A96" }}>Rôle</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#EE813D" }}>Recruteur</span>
            </div>
          </div>

          <div style={{ background:"rgba(214,64,69,0.06)", border:"1px solid rgba(214,64,69,0.15)", borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#D64045" }}>
            ⚠️ Demandez au recruteur de changer son mot de passe dès la première connexion.
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <button onClick={handleCopy} style={{ padding:"12px", borderRadius:11, background:copied?"rgba(26,158,111,0.1)":"rgba(16,64,107,0.05)", border:`1px solid ${copied?"rgba(26,158,111,0.25)":"rgba(16,64,107,0.12)"}`, color:copied?"#1A9E6F":"#10406B", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"all 0.18s" }}>
              {copied ? <><CheckCircle size={14}/> Copié !</> : <><Copy size={14}/> Copier</>}
            </button>
            <button onClick={handleSendEmail} disabled={sending} style={{ padding:"12px", borderRadius:11, background:"linear-gradient(135deg,#EE813D,#d4691f)", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:sending?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 14px rgba(238,129,61,0.3)", opacity:sending?0.75:1 }}>
              {sending ? <><Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/> Envoi…</> : <><Send size={13}/> Envoyer par email</>}
            </button>
          </div>

          <button onClick={onClose} style={{ width:"100%", marginTop:12, padding:"11px", borderRadius:11, background:"transparent", border:"1px solid rgba(16,64,107,0.12)", color:"#5A7A96", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Fermer
          </button>
        </div>
      )}
    </Modal>
  );
}