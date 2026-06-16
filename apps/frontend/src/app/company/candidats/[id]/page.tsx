// frontend/src/app/company/candidats/[id]/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft, MapPin, Phone, Mail, Briefcase,
  Star, Award, Globe2, Download, Loader2,
  CheckCircle, XCircle, Clock, Eye,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { candidaturesApi, type Candidature } from "@/lib/api";
import toast from "react-hot-toast";
import { useState} from "react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useIsMobile } from "@/hooks/useBreakpoint";

const STATUT_CONFIG: Record<string, { label: string; bg: string; color: string; icon: any }> = {
  EN_ATTENTE: { label: "En attente", bg: "rgba(176,196,212,0.15)", color: "#5A7A96",  icon: Clock       },
  VUE:        { label: "Vue",        bg: "rgba(34,132,192,0.1)",   color: "#2284C0",  icon: Eye         },
  ENTRETIEN:  { label: "Entretien",  bg: "rgba(124,58,237,0.1)",   color: "#7C3AED",  icon: CheckCircle },
  ACCEPTE:    { label: "Accepté",    bg: "rgba(26,158,111,0.1)",   color: "#1A9E6F",  icon: CheckCircle },
  REFUSE:     { label: "Refusé",     bg: "rgba(214,64,69,0.1)",    color: "#D64045",  icon: XCircle     },
};

const SKILL_COLORS = ["#2284C0", "#10406B", "#1A9E6F", "#EE813D", "#7C3AED", "#D64045"];

const NIVEAU_CONFIG: Record<string, { color: string; bg: string }> = {
  "Débutant":      { color: "#B0C4D4", bg: "rgba(176,196,212,0.15)" },
  "Intermédiaire": { color: "#2284C0", bg: "rgba(34,132,192,0.1)"   },
  "Avancé":        { color: "#1A9E6F", bg: "rgba(26,158,111,0.1)"   },
  "Natif":         { color: "#10406B", bg: "rgba(16,64,107,0.1)"    },
};

function skillLevelLabel(niveau: number) {
  if (niveau <= 40) return "Débutant";
  if (niveau <= 70) return "Intermédiaire";
  return "Expert";
}

function CandidatDetailContent() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();
  const qc           = useQueryClient();
  const isMobile = useIsMobile();

  const candidatureId = Number(params.id);
  const backUrl       = searchParams.get("back") ?? "/company/candidats";

  const { data: candidature, isLoading } = useQuery({
    queryKey: ["candidature", candidatureId],
    queryFn: () =>
      candidaturesApi.getOne(candidatureId).then(r => r.data),
  });

  const profile     = candidature?.candidat;

  const markVue = useMutation({
    mutationFn: () => candidaturesApi.updateStatut(candidatureId, "VUE"),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["candidatures-entreprise"] }),
  });

  useEffect(() => {
    if (candidature && candidature.statut === "EN_ATTENTE") markVue.mutate();
  }, [candidature?.id]);

  const updateStatut = useMutation({
  mutationFn: (statut: string) =>
    candidaturesApi.updateStatut(candidatureId, statut),

  onMutate: async (statut) => {
    await qc.cancelQueries({ queryKey: ["candidatures-entreprise"] });
    await qc.cancelQueries({ queryKey: ["candidature", candidatureId] });

    const previousList = qc.getQueryData(["candidatures-entreprise"]);
    const previousItem = qc.getQueryData(["candidature", candidatureId]);

    // Optimistically update list
    qc.setQueryData(["candidatures-entreprise"], (old: any) =>
      old?.map((c: any) => c.id === candidatureId ? { ...c, statut } : c)
    );

    // Optimistically update single candidature
    qc.setQueryData(["candidature", candidatureId], (old: any) =>
      old ? { ...old, statut } : old
    );

    return { previousList, previousItem };
  },

  onError: (_err, _statut, context) => {
    qc.setQueryData(["candidatures-entreprise"], context?.previousList);
    qc.setQueryData(["candidature", candidatureId], context?.previousItem);
  },

  onSettled: () => {
    qc.invalidateQueries({ queryKey: ["candidatures-entreprise"] });
    qc.invalidateQueries({ queryKey: ["candidature", candidatureId] });
  },

  onSuccess: (_, statut) => {
    toast.success(`Statut mis à jour : ${STATUT_CONFIG[statut]?.label}`);
  },
});

  if (isLoading) return (
    <AppShell pageTitle="Candidat">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, gap: 12 }}>
        <Loader2 size={28} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ color: "#5A7A96" }}>Chargement…</span>
      </div>
    </AppShell>
  );

  if (!candidature || !profile) return (
    <AppShell pageTitle="Candidat">
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#10406B", marginBottom: 8 }}>Candidature introuvable</div>
        <button onClick={() => router.back()} style={{ padding: "10px 20px", borderRadius: 10, background: "#10406B", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          Retour
        </button>
      </div>
    </AppShell>
  );

  const sc          = STATUT_CONFIG[candidature.statut] ?? STATUT_CONFIG.EN_ATTENTE;
  const initials    = `${profile.prenom?.[0] ?? ""}${profile.nom?.[0] ?? ""}`.toUpperCase();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "";
  const cvUrl = profile.cvUrl
    ? `${API_BASE}${profile.cvUrl}`
    : null;
  const skills      = profile.competences ?? [];
  const experiences = profile.experiences ?? [];
  const formations  = profile.formations  ?? [];
  const langues     = profile.langues     ?? [];

  // ── Shared sections (used in both layouts) ──────────────────────────────

  const IdentityCard = (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <AvatarUpload
          initials={initials}
          avatarUrl={profile.avatarUrl}
          size={isMobile ? 60 : 80}
          readOnly
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#0D2137", marginBottom: 2 }}>{profile.prenom} {profile.nom}</div>
          {profile.titre && <div style={{ color: "#5A7A96", fontSize: 13, marginBottom: 4 }}>{profile.titre}</div>}
          {profile.localisation && (
            <div style={{ color: "#B0C4D4", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} />{profile.localisation}
            </div>
          )}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sc.bg, color: sc.color, padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          <sc.icon size={12} />{sc.label}
        </div>
      </div>

      {/* Candidature info */}
      <div style={{ padding: "12px 0", borderTop: "1px solid rgba(16,64,107,0.07)", borderBottom: "1px solid rgba(16,64,107,0.07)", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 8 }}>Candidature</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", marginBottom: 3 }}>{candidature.offre?.titre ?? "—"}</div>
        <div style={{ fontSize: 12, color: "#5A7A96" }}>
          Postulé le {new Date(candidature.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        {candidature.offre?.type_contrat && (
          <span style={{ display: "inline-block", marginTop: 6, background: "rgba(34,132,192,0.08)", color: "#2284C0", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 8 }}>{candidature.offre.type_contrat}</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* CV */}
        {cvUrl ? (
          <a href={cvUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", flex: 1 }}>
            <button style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #1A9E6F, #0d7a54)", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={14} /> Télécharger le CV
            </button>
          </a>
        ) : (
          <div style={{ flex: 1, padding: "10px", background: "#F7F8FA", borderRadius: 10, fontSize: 12, color: "#B0C4D4", textAlign: "center" }}>Aucun CV disponible</div>
        )}
      </div>

      {/* Mini stats */}
      <div style={{ display: "flex", marginTop: 14 }}>
        {[[String(skills.length), "Compétences"], [String(experiences.length), "Expériences"], [String(langues.length), "Langues"]].map(([v, l], i, arr) => (
          <div key={l} style={{ flex: 1, textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(16,64,107,0.07)" : "none", padding: "6px 0" }}>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#2284C0" }}>{v}</div>
            <div style={{ color: "#5A7A96", fontSize: 10, marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ContactCard = (
    <div style={{ background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 14 }}>Contact</div>
      {[
        { Icon: Mail,  val: profile.utilisateur?.email ?? "—" },
        { Icon: Phone, val: profile.telephone ?? "Non renseigné" },
        { Icon: MapPin,val: profile.localisation ?? "Non renseigné" },
      ].map(({ Icon, val }, idx) => (
        <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(34,132,192,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={12} color="#2284C0" />
          </div>
          <span style={{ color: "#5A7A96", fontSize: 13 }}>{val}</span>
        </div>
      ))}
    </div>
  );

  const CoverLetterCard = candidature.lettre ? (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(16,64,107,0.05)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 10 }}>Lettre de motivation</div>
      <p style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.7, margin: 0 }}>{candidature.lettre}</p>
    </div>
  ) : null;

  const DecisionPanel = (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
      <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#0D2137", marginBottom: 4 }}>Décision de recrutement</div>
      <p style={{ fontSize: 13, color: "#5A7A96", marginBottom: 18 }}>
        Statut actuel : <strong style={{ color: sc.color }}>{sc.label}</strong>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { statut: "ENTRETIEN", label: "Entretien", color: "#7C3AED", Icon: CheckCircle },
          { statut: "ACCEPTE",   label: "Accepter",  color: "#1A9E6F", Icon: CheckCircle },
          { statut: "REFUSE",    label: "Refuser",   color: "#D64045", Icon: XCircle     },
        ].map(({ statut, label, color, Icon }) => {
          const isActive = candidature.statut === statut;
          return (
            <button
              key={statut}
              onClick={() => updateStatut.mutate(statut)}
              disabled={isActive || updateStatut.isPending}
              style={{
                padding: "14px 12px", borderRadius: 14, border: "2px solid",
                borderColor: isActive ? color : `${color}33`,
                background:  isActive ? `${color}1A` : "white",
                color, fontSize: 13, fontWeight: 700,
                cursor: isActive ? "default" : "pointer",
                fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                opacity: isActive ? 1 : 0.8,
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = `${color}12`; (e.currentTarget as HTMLElement).style.opacity = "1"; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "white"; (e.currentTarget as HTMLElement).style.opacity = "0.8"; } }}
            >
              <Icon size={20} />
              {label}
              {isActive && <span style={{ fontSize: 10 }}>✓ Actuel</span>}
            </button>
          );
        })}
      </div>
      {updateStatut.isPending && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12, color: "#5A7A96" }}>
          <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> Mise à jour…
        </div>
      )}
    </div>
  );

  const SkillsCard = skills.length > 0 ? (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Star size={16} color="#EE813D" fill="#EE813D" />
        <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Compétences</div>
      </div>
      {skills.map(({ competence, niveau }, i) => (
        <div key={competence.id ?? `skill-${i}`} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D2137" }}>{competence.nom}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: SKILL_COLORS[i % SKILL_COLORS.length] }}>
              {niveau}% ({skillLevelLabel(niveau)})
            </span>
          </div>
          <div style={{ height: 7, background: "#F0F4F8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${niveau}%`, borderRadius: 4, background: `linear-gradient(90deg, ${SKILL_COLORS[i % SKILL_COLORS.length]}80, ${SKILL_COLORS[i % SKILL_COLORS.length]})` }} />
          </div>
        </div>
      ))}
    </div>
  ) : null;

  const ExperiencesCard = experiences.length > 0 ? (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Briefcase size={16} color="#2284C0" />
        <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Expérience professionnelle</div>
      </div>
      {experiences.map((exp, i) => {
        const color = SKILL_COLORS[i % SKILL_COLORS.length];
        return (
          <div key={exp.id ?? `exp-${i}`} style={{ display: "flex", gap: 14, marginBottom: i < experiences.length - 1 ? 24 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: color, marginTop: 4, boxShadow: `0 0 0 3px ${color}25` }} />
              {i < experiences.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(16,64,107,0.07)", marginTop: 6, borderRadius: 1 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "#0D2137" }}>{exp.poste}</div>
                <span style={{ fontSize: 11, color: "#5A7A96", background: "#F7F8FA", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>
                  {exp.dateDebut} – {exp.actuel ? "Présent" : (exp.dateFin ?? "?")}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 4 }}>{exp.entreprise}</div>
              {exp.description && <div style={{ fontSize: 12, color: "#5A7A96", lineHeight: 1.6 }}>{exp.description}</div>}
            </div>
          </div>
        );
      })}
    </div>
  ) : null;

  const FormationsCard = formations.length > 0 ? (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Award size={16} color="#10406B" />
        <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Formation</div>
      </div>
      {formations.map((f, i) => {
        const color = SKILL_COLORS[i % SKILL_COLORS.length];
        return (
          <div key={f.id ?? `form-${i}`} style={{ background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 10, borderLeft: `4px solid ${color}` }}>
            <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: "#0D2137", marginBottom: 3 }}>{f.diplome}</div>
            <div style={{ fontSize: 11, color: "#5A7A96" }}>{f.ecole} · {f.annee}</div>
          </div>
        );
      })}
    </div>
  ) : null;

  const LanguesCard = langues.length > 0 ? (
    <div style={{ background: "white", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(16,64,107,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Globe2 size={16} color="#7C3AED" />
        <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "#0D2137" }}>Langues</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {langues.map((l, idx) => {
          const nc = NIVEAU_CONFIG[l.niveau] ?? { color: "#5A7A96", bg: "rgba(90,122,150,0.1)" };
          return (
            <div key={l.id ?? `lang-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F7F8FA", borderRadius: 10, border: "1px solid rgba(16,64,107,0.06)" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#0D2137" }}>{l.nom}</span>
              <span style={{ background: nc.bg, color: nc.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>{l.niveau}</span>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <AppShell pageTitle="Profil candidat">

      {/* Back button */}
      <button
        onClick={() => router.push(backUrl)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#5A7A96", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", marginBottom: 24, padding: "8px 12px", borderRadius: 10, transition: "all 0.15s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(16,64,107,0.05)"; (e.currentTarget as HTMLElement).style.color = "#10406B"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#5A7A96"; }}
      >
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      {isMobile ? (
        /* ── Mobile: single column, stacked ─────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {IdentityCard}
          {DecisionPanel}
          {ContactCard}
          {CoverLetterCard}
          {SkillsCard}
          {ExperiencesCard}
          {FormationsCard}
          {LanguesCard}
        </div>
      ) : (
        /* ── Desktop: two-column ─────────────────────────────────────────── */
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {IdentityCard}
            {ContactCard}
            {CoverLetterCard}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {DecisionPanel}
            {SkillsCard}
            {ExperiencesCard}
            <div style={{ display: "grid", gridTemplateColumns: langues.length > 0 && formations.length > 0 ? "1fr 1fr" : "1fr", gap: 16 }}>
              {FormationsCard}
              {LanguesCard}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function CandidatDetailPage() {
  return (
    <Suspense fallback={
      <AppShell pageTitle="Candidat">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, gap: 12 }}>
          <Loader2 size={28} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      </AppShell>
    }>
      <CandidatDetailContent />
    </Suspense>
  );
}