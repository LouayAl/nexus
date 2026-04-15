"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

function OAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    authApi.me()
      .then(({ data }) => {
        if (data.role !== "CANDIDAT") {
          authApi.logout().catch(() => undefined).finally(() => {
            router.replace("/auth/login");
          });
          return;
        }

        router.replace("/profile");
      })
      .catch(() => {
        router.replace("/auth/login");
      });
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      background: "#FAFAF8",
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "linear-gradient(135deg, #EE813D, #2284C0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span className="font-display" style={{ color: "white", fontSize: 20, fontWeight: 900 }}>N</span>
      </div>
      <div style={{ color: "#5A7A96", fontSize: 14 }}>Connexion en cours...</div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return <Suspense><OAuthHandler /></Suspense>;
}
