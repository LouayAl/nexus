// frontend/src/app/company/dashboard/CandidatsModal.tsx
// ═══════════════════════════════════════════════════════════════════════════════
// CANDIDATS MODAL
// ═══════════════════════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Download, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "./Modal";
import { STATUT_CONFIG, type Offre, type Candidature } from "./constants";
import { offresApi, candidaturesApi } from "@/lib/api";

interface CandidatsModalProps {
  offre: Offre;
  onClose: () => void;
}

export function CandidatsModal({ offre, onClose }: CandidatsModalProps) {
  const queryClient = useQueryClient();
  
  const { data: candidatures = [], isLoading } = useQuery({ 
    queryKey: ["candidatures-offre", offre.id], 
    queryFn: () => candidaturesApi.getByOffre(offre.id).then(r => r.data) 
  });
 
  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) => 
      candidaturesApi.updateStatut(id, statut), 
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["candidatures-offre", offre.id] }); 
      toast.success("Statut mis à jour"); 
    }, 
    onError: () => toast.error("Erreur") 
  });

  const closeOffre = useMutation({
    mutationFn: () => offresApi.updateStatut(offre.id, "FERMEE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mes-offres"] });
    },
    onError: () => toast.error("Erreur lors de la clôture de l'offre")
  });

  const handleAccept = async (candidatId: number) => {
    try {
      // Update candidate status to accepted
      await updateStatut.mutateAsync({ id: candidatId, statut: "ACCEPTE" });
      
      // Close the offer
      await closeOffre.mutateAsync();
      
      toast.success("Candidat accepté ! L'offre a été clôturée.");
      onClose(); // Close the modal after accepting
    } catch (error) {
      toast.error("Erreur lors de l'acceptation");
    }
  };

  return (
    <Modal title={`Candidats — ${offre.titre}`} onClose={onClose} wide>
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12 }}>
          <Loader2 size={24} color="#2284C0" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: "#5A7A96" }}>Chargement…</span>
        </div>
      ) : (
        <>
          {/* Warning if offer is closed */}
          {offre.statut === "FERMEE" && (
            <div style={{ background: "rgba(214,64,69,0.1)", border: "1px solid rgba(214,64,69,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle size={16} color="#D64045" />
              <span style={{ fontSize: 13, color: "#D64045", fontWeight: 600 }}>
                Cette offre est clôturée. Plus de candidatures acceptées.
              </span>
            </div>
          )}
          
          {candidatures.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#10406B", marginBottom: 6 }}>Aucune candidature</div>
              <div style={{ color: "#5A7A96", fontSize: 13 }}>Aucun candidat n'a encore postulé à cette offre.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {candidatures.map((c: Candidature) => {
                const statusConfig = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG.EN_ATTENTE;
                const initials = c.candidat ? `${c.candidat.prenom?.[0] ?? ""}${c.candidat.nom?.[0] ?? ""}`.toUpperCase() : "??";
                const name = c.candidat ? `${c.candidat.prenom} ${c.candidat.nom}` : "Candidat";
                const API_BASE =
                  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "";

                const cvUrl = c.candidat?.cvUrl
                  ? `${API_BASE}${c.candidat.cvUrl}`
                  : null;
                const isAlreadyAccepted = c.statut === "ACCEPTE";

                return (
                  <div key={c.id} style={{ background: "#F7F8FA", border: "1px solid rgba(16,64,107,0.08)", borderRadius: 16, padding: "16px 18px", opacity: isAlreadyAccepted ? 0.7 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #EE813D, #2284C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white" }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0D2137", marginBottom: 2 }}>
                          {name}
                          {isAlreadyAccepted && <span style={{ marginLeft: 8, background: "#1A9E6F", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>Accepté</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#5A7A96" }}>
                          {c.candidat?.titre ?? "Candidat"} · Postulé le {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                        {(c.candidat?.competences?.length ?? 0) > 0 && (
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                            {c.candidat!.competences!.slice(0, 4).map(comp => (
                              <span key={comp.competenceId} style={{ background: "rgba(34,132,192,0.08)", color: "#2284C0", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>
                                {comp.competence.nom}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        {cvUrl && (
                          <a href={cvUrl} target="_blank" rel="noreferrer">
                            <button style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(26,158,111,0.2)", background: "rgba(26,158,111,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Download size={13} color="#1A9E6F" />
                            </button>
                          </a>
                        )}
                        
                        {/* Accept button - only show if not already accepted and offer is open */}
                        {!isAlreadyAccepted && offre.statut !== "FERMEE" && (
                          <button
                            onClick={() => handleAccept(c.id as number)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "#1A9E6F",
                              border: "none",
                              color: "white",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <CheckCircle size={12} />
                            Accepter
                          </button>
                        )}
                        
                        {/* Status selector - only show if not accepted and offer is open */}
                        {!isAlreadyAccepted && offre.statut !== "FERMEE" && (
                          <select 
                            value={c.statut} 
                            onChange={e => updateStatut.mutate({ id: c.id as number, statut: e.target.value })} 
                            style={{ padding: "5px 10px", borderRadius: 99, border: `1px solid ${statusConfig.color}30`, background: statusConfig.bg, color: statusConfig.color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                          >
                            {Object.entries(STATUT_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    {c.lettre && (
                      <div style={{ marginTop: 12, padding: "10px 14px", background: "white", borderRadius: 10, border: "1px solid rgba(16,64,107,0.07)", fontSize: 12, color: "#5A7A96", lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 600, color: "#10406B" }}>Lettre : </span>{c.lettre}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}