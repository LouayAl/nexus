// apps/backend/src/auth/oauth-callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/api";
import { Suspense } from "react";

function OAuthHandler() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const dest  = searchParams.get("dest") ?? "discover";
    if (token) {
      setToken(token);
      router.replace(`/${dest}`);
    } else {
      router.replace("/auth/login");
    }
  }, []);

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", flexDirection:"column", gap:16,
      background:"#FAFAF8",
    }}>
      <div style={{
        width:44, height:44, borderRadius:12,
        background:"linear-gradient(135deg, #EE813D, #2284C0)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <span className="font-display" style={{ color:"white", fontSize:20, fontWeight:900 }}>N</span>
      </div>
      <div style={{ color:"#5A7A96", fontSize:14 }}>Connexion en cours…</div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return <Suspense><OAuthHandler/></Suspense>;
}