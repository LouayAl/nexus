"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Loader2, Building2 } from "lucide-react";
import { entreprisesApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resolveAvatarUrl } from "@/lib/avatar";

async function compressImage(file: File, maxSizePx = 400, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSizePx / Math.max(img.width, img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => resolve(blob
          ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" })
          : file
        ),
        "image/jpeg", quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface Props {
  nom:      string;
  logoUrl?: string | null;
  size?:    number;
  readOnly?: boolean;
  queryKey?: string;
}

export function LogoUpload({ nom, logoUrl, size = 80, readOnly, queryKey = "entreprise-profile" }: Props) {
  const qc       = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localSrc,  setLocalSrc]  = useState<string | null>(null);
  const [imgError,  setImgError]  = useState(false);

  const remoteSrc = resolveAvatarUrl(logoUrl);
  const src = localSrc ?? (imgError ? null : remoteSrc);

  // First letter of company name for fallback
  const letter = nom?.charAt(0)?.toUpperCase() ?? "E";
  const radius = size * 0.22;

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Fichier image requis"); return; }

    const rawBlob = URL.createObjectURL(file);
    setLocalSrc(rawBlob);
    setImgError(false);
    setUploading(true);

    try {
      const compressed = await compressImage(file, 400, 0.85);
      await entreprisesApi.uploadLogo(compressed);
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success("Logo mis à jour");
    } catch {
      toast.error("Erreur lors de l'upload");
      setLocalSrc(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(rawBlob);
    }
  }, [qc, queryKey]);

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0, cursor: readOnly ? "default" : "pointer" }}
      onClick={() => !readOnly && !uploading && inputRef.current?.click()}
    >
      {/* Circle */}
      <div style={{
        width: size, height: size, borderRadius: radius, overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.25)",
        background: src ? "white" : "linear-gradient(135deg, #10406B, #2284C0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.32, fontWeight: 900, color: "white",
        fontFamily: "'Fraunces',serif", position: "relative",
      }}>
        {src ? (
          <img
            src={src} alt="logo"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", padding: 4 }}
            onError={() => { setImgError(true); setLocalSrc(null); }}
          />
        ) : (
          <span style={{ userSelect: "none" }}>{letter}</span>
        )}

        {/* Hover overlay */}
        {!readOnly && (
          <div className="logo-overlay" style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s",
          }}>
            {uploading
              ? <Loader2 size={size * 0.28} color="white" style={{ animation: "spin 1s linear infinite" }} />
              : <Camera  size={size * 0.28} color="white" />
            }
          </div>
        )}
      </div>

      {/* Camera badge */}
      {!readOnly && (
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: size * 0.3, height: size * 0.3, borderRadius: "50%",
          background: uploading ? "#5A7A96" : "#2284C0",
          border: "2px solid white",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>
          {uploading
            ? <Loader2 size={size * 0.15} color="white" style={{ animation: "spin 1s linear infinite" }} />
            : <Camera  size={size * 0.15} color="white" />
          }
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      <style>{`div:hover > div > .logo-overlay { opacity: 1 !important; }`}</style>
    </div>
  );
}