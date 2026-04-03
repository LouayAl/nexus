// ═══════════════════════════════════════════════════════════════════════════════
// MODAL SHELL
// ═══════════════════════════════════════════════════════════════════════════════

import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}

export function Modal({ title, onClose, wide = false, children }: ModalProps) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(13,33,55,0.3)", backdropFilter: "blur(3px)" }}/>
      <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: wide ? 780 : 560, maxHeight: "90vh", boxShadow: "0 32px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)", pointerEvents: "all", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", borderBottom: "1px solid rgba(16,64,107,0.07)", flexShrink: 0 }}>
            <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "#0D2137" }}>{title}</h3>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(16,64,107,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={15} color="#5A7A96"/>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}