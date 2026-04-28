// frontend/src/app/profile/_components/Modal.tsx
"use client";

import { X, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

export function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 12px", pointerEvents:"none" }}>
        <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:480, boxShadow:"0 24px 80px rgba(16,64,107,0.2)", pointerEvents:"all", overflow:"hidden", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(16,64,107,0.07)" }}>
            <h3 className="font-display" style={{ fontSize:18, fontWeight:800, color:"#0D2137" }}>{title}</h3>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color="#5A7A96"/>
            </button>
          </div>
          <div style={{ padding:"24px", overflowY:"auto", flex:1 }}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#5A7A96", marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputSx: React.CSSProperties = {
  width:"100%", padding:"11px 14px", borderRadius:10,
  border:"1.5px solid rgba(16,64,107,0.12)", outline:"none",
  fontSize:13, color:"#0D2137", fontFamily:"'DM Sans',sans-serif",
  background:"#FAFAF8", boxSizing:"border-box",
};

export function SubmitBtn({ loading, label = "Enregistrer" }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:"100%", padding:"12px", marginTop:8,
      background:"linear-gradient(135deg, #10406B, #2284C0)",
      border:"none", borderRadius:11, color:"white",
      fontSize:14, fontWeight:700, cursor:loading ? "not-allowed" : "pointer",
      fontFamily:"'DM Sans',sans-serif", opacity:loading ? 0.75 : 1,
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    }}>
      {loading
        ? <><Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> Enregistrement…</>
        : label
      }
    </button>
  );
}