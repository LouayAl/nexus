// ═══════════════════════════════════════════════════════════════════════════════
// OFFER DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { MapPin, Briefcase, Clock, Users, Target, CheckCircle, Edit2, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { CONTRACT_COLORS, OFFRE_STATUT_CONFIG, getEmoji, type Offre } from "./constants";
import { offresApi } from "@/lib/api";
import { useRouter } from "next/navigation";



interface OfferDetailModalProps {
  offre: Offre;
  onClose: () => void;
  onEdit: () => void;
  onViewCandidats: () => void;
  onStatusChange?: () => void; // Add this prop
}

const STATUS_ORDER = ["EN_ATTENTE", "OUVERTE", "FERMEE"];

export function OfferDetailModal({ offre, onClose, onEdit, onViewCandidats, onStatusChange }: OfferDetailModalProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const contract = CONTRACT_COLORS[offre.type_contrat] ?? { bg: "rgba(16,64,107,0.08)", color: "#10406B" };
  const salary = offre.salaire_min && offre.salaire_max ? `${Math.round(offre.salaire_min / 1000)}K – ${Math.round(offre.salaire_max / 1000)}K  MAD / an` : null;
  const skills = offre.competences?.map(c => c.competence) ?? [];
  const statutConfig = OFFRE_STATUT_CONFIG[offre.statut] ?? OFFRE_STATUT_CONFIG.FERMEE;

  const handleStatusChange = async (newStatut: string) => {
    setIsUpdatingStatus(true);
    setShowStatusMenu(false);
    try {
      await offresApi.updateStatut(offre.id, newStatut);
      toast.success("Statut mis à jour");
      onStatusChange?.(); // Call the refresh callback
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Modal title="Détail de l'offre" onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, fontSize: 22, flexShrink: 0, background: `linear-gradient(135deg, ${contract.color}18, ${contract.color}30)`, border: `1px solid ${contract.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {getEmoji(offre)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ ...contract, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99 }}>{offre.type_contrat}</span>
          </div>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "#0D2137", marginBottom: 4 }}>{offre.titre}</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {offre.localisation && <span style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{offre.localisation}</span>}
            {offre.niveau_experience && <span style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={11} />{offre.niveau_experience}</span>}
            <span style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{new Date(offre.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </div>

      {/* Stats Row - WITH CLICKABLE STATUS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20, position: "relative" }}>
        
        {/* Candidatures */}
        <div style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(16,64,107,0.07)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5A7A96", marginBottom: 4 }}>Candidatures</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2284C0" }}>{offre._count?.candidatures ?? 0}</div>
        </div>

        {/* Rémunération */}
        <div style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(16,64,107,0.07)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5A7A96", marginBottom: 4 }}>Rémunération</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A9E6F" }}>{salary ?? "Non précisé"}</div>
        </div>

        {/* STATUT - CLICKABLE */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={isUpdatingStatus}
            style={{
              width: "100%",
              background: "#F7F8FA",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid rgba(16,64,107,0.07)",
              textAlign: "left",
              cursor: isUpdatingStatus ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#5A7A96" }}>
              Statut {isUpdatingStatus && <Loader2 size={10} style={{ animation: "spin 0.8s linear infinite", display: "inline" }} />}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: statutConfig.color }}>{statutConfig.label}</span>
              <ChevronDown size={14} color={statutConfig.color} />
            </div>
          </button>
          
          {/* Status Dropdown Menu */}
          {showStatusMenu && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "white", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden" }}>
              {STATUS_ORDER.map((status) => {
                const config = OFFRE_STATUT_CONFIG[status];
                const isCurrentStatus = status === offre.statut;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isCurrentStatus}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      background: isCurrentStatus ? config.bg : "transparent",
                      border: "none",
                      color: isCurrentStatus ? config.color : "#0D2137",
                      fontSize: 12,
                      fontWeight: isCurrentStatus ? 700 : 500,
                      cursor: isCurrentStatus ? "default" : "pointer",
                    }}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 10 }}>Compétences</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{skills.map(c => <span key={c.id} style={{ background: "#F0F4F8", color: "#2284C0", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8, border: "1px solid rgba(34,132,192,0.15)" }}>{c.nom}</span>)}</div>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 10 }}>Description</div>
        <p style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{offre.description}</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push(`/company/candidats?offreId=${offre.id}`)} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #EE813D, #d4691f)", border: "none", borderRadius: 11, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 16px rgba(238,129,61,0.3)" }}>
          <Users size={14} /> Voir les candidats ({offre._count?.candidatures ?? 0})
        </button>
        <button onClick={onEdit} style={{ padding: "12px 20px", borderRadius: 11, background: "rgba(34,132,192,0.08)", border: "1px solid rgba(34,132,192,0.2)", color: "#2284C0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 7 }}>
          <Edit2 size={13} /> Modifier
        </button>
      </div>
    </Modal>
  );
}