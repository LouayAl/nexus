"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { BrandLogo } from "@/components/common/BrandLogo";

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
        <BrandLogo height={42} dark />
      <div style={{ color: "#5A7A96", fontSize: 14 }}>Connexion en cours...</div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return <Suspense><OAuthHandler /></Suspense>;
}
