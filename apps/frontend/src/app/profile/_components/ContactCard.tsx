// frontend/src/app/profile/_components/ContactCard.tsx
"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import type { CandidatProfile } from "@/lib/api";
import type { AppLanguage } from "@/hooks/useAppLanguage";

interface Props {
  profile:        CandidatProfile;
  email:          string;
  onEdit:         () => void;
  onChangePw:     () => void;
  language: AppLanguage;
}

export function ContactCard({ profile, email, onEdit, onChangePw, language }: Props) {
  return (
    <div style={{ background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.08)", borderRadius:16, padding:20 }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96" }}>Contact</div>
        <button onClick={onEdit} style={{ background:"none", border:"none", cursor:"pointer", color:"#2284C0", fontSize:11, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>Modifier</button>
      </div>

      {[
        { Icon:Mail,  val: email                       },
        { Icon:Phone, val: profile.telephone    ?? "Non renseigné" },
        { Icon:MapPin,val: profile.localisation ?? "Non renseigné" },
      ].map(({ Icon, val }, idx) => (
        <div key={idx} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"rgba(34,132,192,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon size={13} color="#2284C0"/>
          </div>
          <span style={{ color:"#5A7A96", fontSize:13 }}>{val}</span>
        </div>
      ))}

      {/* Change password */}
      <button
        onClick={onChangePw}
        style={{ marginTop:6, width:"100%", padding:"10px", borderRadius:10, border:"1px solid rgba(16,64,107,0.12)", background:"white", color:"#5A7A96", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.18s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#2284C0"; (e.currentTarget as HTMLElement).style.color="#2284C0"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(16,64,107,0.12)"; (e.currentTarget as HTMLElement).style.color="#5A7A96"; }}
      >
        🔒 Changer le mot de passe
      </button>
    </div>
  );
}