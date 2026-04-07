// frontend/src/app/admin/components/EntrepriseDetailModal.tsx
"use client";

import { MapPin, Users, Briefcase } from "lucide-react";
import { Modal } from "./Modal";
import { type EntrepriseAdmin } from "@/lib/api";

export function EntrepriseDetailModal({
  entreprise,
  onClose,
}: {
  entreprise: EntrepriseAdmin;
  onClose: () => void;
}) {
  const ouvertes = entreprise.offres.filter((o) => o.statut === "OUVERTE").length;
  const total = entreprise.offres.reduce((s, o) => s + o._count.candidatures, 0);

  return (
    <Modal title="Profil entreprise" onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, #10406B, #2284C0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "white",
            fontFamily: "'Fraunces',serif", flexShrink: 0,
          }}
        >
          {entreprise.nom.charAt(0)}
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: "#0D2137", marginBottom: 4 }}>
            {entreprise.nom}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {entreprise.secteur && <span style={{ fontSize: 12, color: "#2284C0", fontWeight: 600 }}>{entreprise.secteur}</span>}
            {entreprise.localisation && (
              <span style={{ fontSize: 12, color: "#5A7A96", display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={10} />{entreprise.localisation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total offres", value: entreprise._count.offres, color: "#2284C0" },
          { label: "Ouvertes", value: ouvertes, color: "#1A9E6F" },
          { label: "Candidatures", value: total, color: "#EE813D" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(16,64,107,0.07)", textAlign: "center" }}
          >
            <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#5A7A96", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ background: "#F7F8FA", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
        {[
          { label: "Email", value: entreprise.utilisateur.email },
          { label: "Secteur", value: entreprise.secteur ?? "—" },
          { label: "Localisation", value: entreprise.localisation ?? "—" },
          { label: "Site web", value: entreprise.siteWeb ?? "—" },
          { label: "Membre depuis", value: new Date(entreprise.utilisateur.createdAt).toLocaleDateString("fr-FR") },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(16,64,107,0.05)" }}>
            <span style={{ fontSize: 12, color: "#5A7A96" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0D2137" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      {entreprise.description && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 8 }}>Description</div>
          <p style={{ fontSize: 13, color: "#3D5A73", lineHeight: 1.7, margin: 0 }}>{entreprise.description}</p>
        </div>
      )}

      {/* Offers list */}
      {entreprise.offres.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#5A7A96", marginBottom: 10 }}>
            Offres publiées
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entreprise.offres.map((o) => {
              const sc =
                o.statut === "OUVERTE"
                  ? { color: "#1A9E6F", bg: "rgba(26,158,111,0.1)", label: "Ouverte" }
                  : o.statut === "EN_ATTENTE"
                  ? { color: "#EE813D", bg: "rgba(238,129,61,0.1)", label: "En attente" }
                  : { color: "#D64045", bg: "rgba(214,64,69,0.1)", label: "Fermée" };
              return (
                <div
                  key={o.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F7F8FA", borderRadius: 10, border: "1px solid rgba(16,64,107,0.06)" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0D2137" }}>{o.titre}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#5A7A96", display: "flex", alignItems: "center", gap: 3 }}>
                      <Users size={10} />{o._count.candidatures}
                    </span>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}