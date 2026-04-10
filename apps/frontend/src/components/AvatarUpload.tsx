// frontend/src/components/AvatarUpload.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Loader2 } from "lucide-react";
import { candidatsApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001";

// ── Client-side image compression ────────────────────────────────────────────
async function compressImage(file: File, maxSizePx = 400, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxSizePx / Math.max(img.width, img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type:"image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  initials:   string;
  avatarUrl?: string | null;
  size?:      number;
  readOnly?:  boolean;
}

export function AvatarUpload({ initials, avatarUrl, size = 80, readOnly }: Props) {
  const qc       = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localSrc,  setLocalSrc]  = useState<string | null>(null); // compressed blob
  const [imgError,  setImgError]  = useState(false);

  // Reset error when avatarUrl changes (new upload from server)
  const remoteSrc = avatarUrl ? `${API_BASE}${avatarUrl}` : null;
  const src = localSrc ?? (imgError ? null : remoteSrc);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }

    // Show instant preview using the raw file (no size restriction on preview)
    const rawBlob = URL.createObjectURL(file);
    setLocalSrc(rawBlob);
    setImgError(false);
    setUploading(true);

    try {
      // Compress to ≤400px, ~80KB before uploading
      const compressed = await compressImage(file, 400, 0.82);
      await candidatsApi.uploadAvatar(compressed);
      qc.invalidateQueries({ queryKey:["profile"] });
      toast.success("Photo mise à jour");
    } catch (err: any) {
      toast.error("Erreur lors de l'upload");
      // Revert preview on failure
      setLocalSrc(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(rawBlob); // clean up memory
    }
  }, [qc]);

  const radius = size * 0.22;

  return (
    <div
      style={{ position:"relative", width:size, height:size, flexShrink:0, cursor:readOnly?"default":"pointer" }}
      onClick={() => !readOnly && !uploading && inputRef.current?.click()}
    >
      {/* Circle */}
      <div style={{
        width:size, height:size, borderRadius:radius, overflow:"hidden",
        border:"2px solid rgba(255,255,255,0.25)",
        background: src ? "transparent" : "linear-gradient(135deg, #EE813D, #2284C0)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:size * 0.32, fontWeight:900, color:"white",
        fontFamily:"'Fraunces',serif", position:"relative",
      }}>
        {src ? (
          <img
            src={src}
            alt="avatar"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            // ← KEY FIX: fall back to initials on any load error
            onError={() => { setImgError(true); setLocalSrc(null); }}
          />
        ) : (
          <span style={{ userSelect:"none" }}>{initials}</span>
        )}

        {/* Hover overlay */}
        {!readOnly && (
          <div className="av-overlay" style={{
            position:"absolute", inset:0, background:"rgba(0,0,0,0.45)",
            display:"flex", alignItems:"center", justifyContent:"center",
            opacity:0, transition:"opacity 0.2s",
          }}>
            {uploading
              ? <Loader2 size={size*0.28} color="white" style={{ animation:"spin 1s linear infinite" }}/>
              : <Camera  size={size*0.28} color="white"/>
            }
          </div>
        )}
      </div>

      {/* Camera badge */}
      {!readOnly && (
        <div style={{
          position:"absolute", bottom:-2, right:-2,
          width:size*0.3, height:size*0.3, borderRadius:"50%",
          background: uploading ? "#5A7A96" : "#2284C0",
          border:"2px solid white",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background 0.2s",
        }}>
          {uploading
            ? <Loader2 size={size*0.15} color="white" style={{ animation:"spin 1s linear infinite" }}/>
            : <Camera  size={size*0.15} color="white"/>
          }
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value=""; }}
      />

      <style>{`.av-overlay { } div:hover > div > .av-overlay { opacity: 1 !important; }`}</style>
    </div>
  );
}