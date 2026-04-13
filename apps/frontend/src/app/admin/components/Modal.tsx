"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({ title, onClose, wide = false, children }: {
  title:    string;
  onClose:  () => void;
  wide?:    boolean;
  children: React.ReactNode;
}) {
  return createPortal(
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(13,33,55,0.3)", backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px", pointerEvents:"none" }}>
        <div style={{
          background:"white", borderRadius:20, width:"100%",
          maxWidth: wide ? 720 : 540,
          maxHeight:"94vh",
          boxShadow:"0 32px 80px rgba(16,64,107,0.2), 0 0 0 1px rgba(16,64,107,0.06)",
          pointerEvents:"all", display:"flex", flexDirection:"column", overflow:"hidden",
        }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", borderBottom:"1px solid rgba(16,64,107,0.07)", flexShrink:0 }}>
            <h3 className="font-display" style={{ fontSize:"clamp(16px,4vw,20px)", fontWeight:800, color:"#0D2137", margin:0 }}>{title}</h3>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(16,64,107,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
              <X size={14} color="#5A7A96"/>
            </button>
          </div>
          {/* Body */}
          <div style={{ flex:1, overflowY:"auto", padding:"clamp(16px,4vw,24px)", WebkitOverflowScrolling:"touch" } as any}>
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}