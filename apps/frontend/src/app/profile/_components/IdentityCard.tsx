// frontend/src/app/profile/_components/IdentityCard.tsx
"use client";

import { Upload, Edit2, Download, Loader2, MapPin } from "lucide-react";
import { type CandidatProfile } from "@/lib/api";
import { initials, completionPct } from "./types";
import { AvatarUpload } from "@/components/AvatarUpload";

interface Props {
  profile:       CandidatProfile;
  uploadPending: boolean;
  isMobile:      boolean;
  onEdit:        () => void;
  onUploadCv:    () => void;
}

export function IdentityCard({ profile, uploadPending, isMobile, onEdit, onUploadCv }: Props) {
  const pct    = completionPct(profile);
  const exps   = profile.experiences ?? [];
  const skills = profile.competences ?? [];
  const langs  = profile.langues     ?? [];
  const cvUrl  = profile.cvUrl
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api","") ?? "http://localhost:3001"}${profile.cvUrl}`
    : null;

  return (
    <div style={{ background:"white", border:"1px solid rgba(16,64,107,0.08)", borderRadius:20, padding: isMobile ? 20 : 28, boxShadow:"0 2px 12px rgba(16,64,107,0.06)" }}>

      {/* ── Mobile: avatar left, name/title/location right ── */}
      {isMobile ? (
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <AvatarUpload
            initials={initials(profile)}
            avatarUrl={profile.avatarUrl}
            size={64}
          />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
              <div className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137", marginBottom:2 }}>
                {profile.prenom} {profile.nom}
              </div>
              <button onClick={onEdit} style={{ flexShrink:0, background:"none", border:"1px solid rgba(16,64,107,0.12)", borderRadius:8, padding:"4px 8px", cursor:"pointer", display:"flex", alignItems:"center", gap:4, color:"#5A7A96" }}>
                <Edit2 size={11}/><span style={{ fontSize:11, fontWeight:600 }}>Éditer</span>
              </button>
            </div>
            {profile.titre && <div style={{ color:"#5A7A96", fontSize:13, marginBottom:4 }}>{profile.titre}</div>}
            {profile.localisation && (
              <div style={{ color:"#B0C4D4", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                <MapPin size={11}/>{profile.localisation}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Desktop: centered, avatar on top ── */
        <div style={{ textAlign:"center", marginBottom:0 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
            <AvatarUpload
              initials={initials(profile)}
              avatarUrl={profile.avatarUrl}
              size={88}
            />
          </div>
          <div className="font-display" style={{ fontSize:22, fontWeight:800, color:"#0D2137", marginBottom:4 }}>
            {profile.prenom} {profile.nom}
          </div>
          {profile.titre && <div style={{ color:"#5A7A96", fontSize:14, marginBottom:6 }}>{profile.titre}</div>}
          {profile.localisation && (
            <div style={{ color:"#B0C4D4", fontSize:12, display:"flex", alignItems:"center", gap:4, justifyContent:"center", marginBottom:12 }}>
              <MapPin size={11}/>{profile.localisation}
            </div>
          )}
          <button onClick={onEdit} style={{ background:"none", border:"1px solid rgba(16,64,107,0.12)", borderRadius:9, padding:"6px 14px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:5, color:"#5A7A96", fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
            <Edit2 size={12}/> Éditer le profil
          </button>
        </div>
      )}

      {/* Completion bar */}
      <div style={{ margin:"20px 0", padding:"16px 0", borderTop:"1px solid rgba(16,64,107,0.07)", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, color:"#5A7A96", fontWeight:500 }}>Profil complété</span>
          <span style={{ fontSize:12, fontWeight:700, color: pct >= 80 ? "#1A9E6F" : "#EE813D" }}>{pct}%</span>
        </div>
        <div style={{ height:6, background:"#F0F4F8", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:"linear-gradient(90deg, #EE813D, #2284C0)", transition:"width 0.6s" }}/>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", marginBottom:20 }}>
        {[
          [String(exps.length),   "Expériences"],
          [String(skills.length), "Compétences"],
          [String(langs.length),  "Langues"],
        ].map(([v, l], i, arr) => (
          <div key={l} style={{ flex:1, textAlign:"center", borderRight:i<arr.length-1?"1px solid rgba(16,64,107,0.07)":"none", padding:"0 8px" }}>
            <div className="font-display" style={{ fontSize: isMobile ? 18 : 20, fontWeight:800, color:"#2284C0" }}>{v}</div>
            <div style={{ color:"#5A7A96", fontSize:11, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* CV */}
      {cvUrl ? (
        <div style={{ display:"flex", gap:8 }}>
          <a href={cvUrl} target="_blank" rel="noreferrer" style={{ flex:1, textDecoration:"none" }}>
            <button style={{ width:"100%", padding:"10px", background:"rgba(26,158,111,0.1)", border:"1px solid rgba(26,158,111,0.2)", borderRadius:11, color:"#1A9E6F", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Download size={13}/> Mon CV
            </button>
          </a>
          <button onClick={onUploadCv} style={{ padding:"10px 14px", background:"rgba(238,129,61,0.08)", border:"1px solid rgba(238,129,61,0.15)", borderRadius:11, cursor:"pointer" }}>
            <Upload size={14} color="#EE813D"/>
          </button>
        </div>
      ) : (
        <button onClick={onUploadCv} disabled={uploadPending} style={{ width:"100%", padding:"11px", background:"linear-gradient(135deg, #EE813D, #d4691f)", border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 14px rgba(238,129,61,0.3)", opacity:uploadPending ? 0.7 : 1 }}>
          {uploadPending ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <Upload size={14}/>}
          {uploadPending ? "Importation…" : "Importer mon CV"}
        </button>
      )}
    </div>
  );
}