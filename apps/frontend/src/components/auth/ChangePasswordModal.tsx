"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { Lock, Eye, EyeOff, X, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Props { onClose: () => void; }

export function ChangePasswordModal({ onClose }: Props) {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [done,     setDone]     = useState(false);

  const mut = useMutation({
    mutationFn: () => {
      if (next !== confirm) throw new Error("Les mots de passe ne correspondent pas");
      if (next.length < 6)  throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      return authApi.changePassword({ currentPassword: current, newPassword: next });
    },
    onSuccess: () => { setDone(true); toast.success("Mot de passe modifié !"); },
    onError:   (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message;
      toast.error(msg ?? "Erreur lors de la modification");
    },
  });

  const iSx: React.CSSProperties = {
    width:"100%", padding:"11px 42px 11px 38px", borderRadius:10,
    border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
    fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
    background:"#FAFAF8", transition:"all 0.18s", boxSizing:"border-box",
  };
  const onF = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor="#2284C0"; e.target.style.background="white"; e.target.style.boxShadow="0 0 0 3px rgba(34,132,192,0.08)"; };
  const onB = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor="rgba(16,64,107,0.12)"; e.target.style.background="#FAFAF8"; e.target.style.boxShadow="none"; };

  const strength = next.length === 0 ? 0 : next.length < 6 ? 1 : next.length < 10 ? 2 : /[A-Z]/.test(next) && /[0-9]/.test(next) ? 4 : 3;
  const strengthLabel = ["","Trop court","Faible","Correct","Fort"];
  const strengthColor = ["","#D64045","#EE813D","#2284C0","#1A9E6F"];

  const content = (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24, pointerEvents:"none" }}>
        <div style={{ background:"white", borderRadius:22, width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)", pointerEvents:"all", overflow:"hidden" }}>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ShieldCheck size={16} color="#2284C0"/>
              </div>
              <h3 className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>Changer le mot de passe</h3>
            </div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color="#5A7A96"/>
            </button>
          </div>

          <div style={{ padding:"24px" }}>
            {done ? (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(26,158,111,0.1)", border:"2px solid #1A9E6F", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <CheckCircle size={26} color="#1A9E6F"/>
                </div>
                <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137", marginBottom:8 }}>Mot de passe modifié !</div>
                <p style={{ fontSize:13, color:"#5A7A96", marginBottom:24 }}>Votre nouveau mot de passe est actif immédiatement.</p>
                <button onClick={onClose} style={{ padding:"11px 28px", borderRadius:11, background:"linear-gradient(135deg,#10406B,#2284C0)", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); mut.mutate(); }}>
                {/* Current password */}
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>Mot de passe actuel</label>
                  <div style={{ position:"relative" }}>
                    <Lock size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <input type={showCur?"text":"password"} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Votre mot de passe actuel" required style={iSx} onFocus={onF} onBlur={onB}/>
                    <button type="button" onClick={() => setShowCur(!showCur)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#B0C4D4", display:"flex", padding:0 }}>
                      {showCur ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div style={{ marginBottom:6 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>Nouveau mot de passe</label>
                  <div style={{ position:"relative" }}>
                    <Lock size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <input type={showNew?"text":"password"} value={next} onChange={e => setNext(e.target.value)} placeholder="Min. 6 caractères" required style={iSx} onFocus={onF} onBlur={onB}/>
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#B0C4D4", display:"flex", padding:0 }}>
                      {showNew ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                {/* Strength bar */}
                {next.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ height:4, background:"#F0F4F8", borderRadius:2, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ height:"100%", width:`${strength * 25}%`, background:strengthColor[strength], borderRadius:2, transition:"all 0.3s" }}/>
                    </div>
                    <div style={{ fontSize:11, color:strengthColor[strength], fontWeight:600 }}>{strengthLabel[strength]}</div>
                  </div>
                )}

                {/* Confirm */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:7 }}>Confirmer le nouveau mot de passe</label>
                  <div style={{ position:"relative" }}>
                    <Lock size={13} color="#B0C4D4" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Répétez le nouveau mot de passe" required
                      style={{ ...iSx, borderColor: confirm && next !== confirm ? "#D64045" : undefined }}
                      onFocus={onF} onBlur={onB}/>
                  </div>
                  {confirm && next !== confirm && (
                    <div style={{ fontSize:11, color:"#D64045", marginTop:4 }}>Les mots de passe ne correspondent pas</div>
                  )}
                </div>

                <button type="submit" disabled={mut.isPending || (!!confirm && next !== confirm)} style={{ width:"100%", padding:"13px", background: mut.isPending?"rgba(16,64,107,0.4)":"linear-gradient(135deg,#10406B,#2284C0)", border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:700, cursor:mut.isPending?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:mut.isPending?"none":"0 4px 20px rgba(16,64,107,0.25)" }}>
                  {mut.isPending ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> Modification…</> : <><ShieldCheck size={14}/> Modifier le mot de passe</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}