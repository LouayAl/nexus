// apps/frontend/src/app/discover/_components/JobDrawer.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, MapPin, Building2, Briefcase, Clock, BadgeCheck,
  ArrowRight, Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { candidaturesApi, type Offre } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CONTRACT_COLORS: Record<string, { bg: string; color: string }> = {
  CDI:       { bg:"rgba(26,158,111,0.1)",  color:"#1A9E6F" },
  CDD:       { bg:"rgba(238,129,61,0.12)", color:"#EE813D" },
  Freelance: { bg:"rgba(124,58,237,0.1)",  color:"#7C3AED" },
  Stage:     { bg:"rgba(34,132,192,0.1)",  color:"#2284C0" },
};

function getEmoji(offre: Offre) {
  const skills = offre.competences?.map(c => c.competence.nom) ?? [];
  if (skills.some(s => s.includes("React")))      return "⚛️";
  if (skills.some(s => s.includes("Python")))     return "🐍";
  if (skills.some(s => s.includes("Figma")))      return "🎨";
  if (skills.some(s => s.includes("Kubernetes"))) return "☁️";
  if (skills.some(s => s.includes("Java")))       return "☕";
  if (skills.some(s => s.includes("Pentest")))    return "🔒";
  if (skills.some(s => s.includes("SEO")))        return "📣";
  return "💼";
}

interface Props {
  offre:   Offre | null;
  onClose: () => void;
}

export function JobDrawer({ offre, onClose }: Props) {
  const { user } = useAuth();
  const router   = useRouter();
  const [visible,  setVisible]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);

  useEffect(() => {
    if (offre) {
      setVisible(false);
      setApplied(false);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [offre]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleApply = async () => {
    if (!user) {
      toast("Connectez-vous pour postuler", { icon:"🔒" });
      router.push("/auth/login");
      return;
    }
    if (user.role !== "CANDIDAT") {
      toast.error("Seuls les candidats peuvent postuler.");
      return;
    }
    if (!offre) return;
    setApplying(true);
    try {
      await candidaturesApi.apply(offre.id);
      setApplied(true);
      toast.success("Candidature envoyée !");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(msg ?? "Erreur lors de la candidature.");
    } finally {
      setApplying(false);
    }
  };

  if (!offre) return null;

  const contract = CONTRACT_COLORS[offre.type_contrat] ?? { bg:"rgba(16,64,107,0.08)", color:"#10406B" };
  const salary   = offre.salaire_min && offre.salaire_max
    ? `${Math.round(offre.salaire_min/1000)}K – ${Math.round(offre.salaire_max/1000)}K  MAD / an`
    : null;
  const skills = offre.competences?.map(c => c.competence) ?? [];

  const content = (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position:"fixed", inset:0, zIndex:40,
          background:"rgba(13,33,55,0.25)",
          backdropFilter:"blur(2px)",
          opacity: visible ? 1 : 0,
          transition:"opacity 0.18s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position:"fixed", inset:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px", pointerEvents:"none",
      }}>
        <div style={{
          background:"white",
          borderRadius:24,
          width:"100%", maxWidth:600,
          maxHeight:"85vh",
          boxShadow:"0 24px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)",
          display:"flex", flexDirection:"column",
          pointerEvents:"all",
          opacity:    visible ? 1 : 0,
          transform:  visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(12px)",
          transition: "opacity 0.18s ease, transform 0.18s cubic-bezier(0.22,1,0.36,1)",
          overflow:"hidden",
        }}>

          {/* ── Header ── */}
          <div style={{ padding:"24px 24px 20px", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{
                width:52, height:52, borderRadius:14, fontSize:22, flexShrink:0,
                background:`linear-gradient(135deg, ${contract.color}18, ${contract.color}30)`,
                border:`1px solid ${contract.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {getEmoji(offre)}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setSaved(!saved)} style={{
                  width:36, height:36, borderRadius:"50%", border:"none",
                  background: saved ? "rgba(238,129,61,0.1)" : "rgba(16,64,107,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  <Heart size={15} fill={saved?"#EE813D":"none"} color={saved?"#EE813D":"#5A7A96"}/>
                </button>
                <button onClick={handleClose} style={{
                  width:36, height:36, borderRadius:"50%", border:"none",
                  background:"rgba(16,64,107,0.05)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  <X size={15} color="#5A7A96"/>
                </button>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <span style={{ ...contract, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:99, letterSpacing:"0.04em" }}>
                {offre.type_contrat}
              </span>
            </div>
            <h2 className="font-display" style={{ fontSize:21, fontWeight:800, color:"#0D2137", lineHeight:1.25, marginBottom:8 }}>
              {offre.titre}
            </h2>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#5A7A96" }}>
                <Building2 size={12}/> {offre.entreprise.nom}
              </span>
              {offre.localisation && (
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#5A7A96" }}>
                  <MapPin size={12}/> {offre.localisation}
                </span>
              )}
              {offre.niveau_experience && (
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:"#5A7A96" }}>
                  <Briefcase size={12}/> {offre.niveau_experience}
                </span>
              )}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:20 }}>

            {/* Salary */}
            {salary && (
              <div style={{ background:"linear-gradient(135deg, rgba(34,132,192,0.06), rgba(16,64,107,0.03))", borderRadius:14, padding:"16px 18px", border:"1px solid rgba(34,132,192,0.12)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(135deg, #2284C0, #10406B)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <BadgeCheck size={18} color="white"/>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#5A7A96", marginBottom:2 }}>Rémunération</div>
                  <div className="font-display" style={{ fontSize:19, fontWeight:800, color:"#10406B" }}>{salary}</div>
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>Compétences</div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {skills.map(c => (
                    <span key={c.id} style={{ background:"#F0F4F8", color:"#2284C0", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:8, border:"1px solid rgba(34,132,192,0.15)" }}>
                      {c.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:10 }}>Description</div>
              <div style={{ fontSize:14, color:"#3D5A73", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                {offre.description}
              </div>
            </div>

            {/* Meta chips */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                { label:"Contrat",    value: offre.type_contrat },
                { label:"Expérience", value: offre.niveau_experience },
                { label:"Postulants", value: `${offre._count?.candidatures ?? 0}` },
              ].filter(m => m.value).map(m => (
                <div key={m.label} style={{ background:"#F7F8FA", borderRadius:10, padding:"10px 14px", border:"1px solid rgba(16,64,107,0.07)", minWidth:100 }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#5A7A96", marginBottom:3 }}>{m.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#10406B" }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Date */}
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#B0C4D4" }}>
              <Clock size={11}/>
              Publiée le {new Date(offre.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(16,64,107,0.07)", display:"flex", gap:10 }}>
            <button onClick={handleApply} disabled={applying || applied} style={{
              flex:1, padding:"13px",
              background: applied
                ? "linear-gradient(135deg, #1A9E6F, #147a54)"
                : "linear-gradient(135deg, #EE813D, #d4691f)",
              border:"none", borderRadius:11, color:"white",
              fontSize:14, fontWeight:700, cursor: applying||applied ? "not-allowed" : "pointer",
              fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow: applied ? "0 4px 16px rgba(26,158,111,0.25)" : "0 4px 16px rgba(238,129,61,0.3)",
              transition:"all 0.18s", opacity: applying ? 0.8 : 1,
            }}>
              {applied  ? <><BadgeCheck size={15}/> Candidature envoyée</> :
               applying ? "Envoi en cours…" :
               <><span>Postuler maintenant</span><ArrowRight size={15}/></>}
            </button>
            <button onClick={handleClose} style={{
              padding:"13px 18px", borderRadius:11,
              background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.12)",
              color:"#5A7A96", fontSize:14, fontWeight:600,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            }}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
  return createPortal(content, document.body);

}