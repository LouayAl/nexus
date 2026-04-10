"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60_000,  // 5 min — data stays fresh longer
        gcTime:               10 * 60_000, // 10 min in cache after unmount
        retry: (failureCount, error: any) => {
          const status = error?.response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect:   false,       // don't refetch on network reconnect
      },
      mutations: {
        retry: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background:   "#0D2137",
              color:        "#EDF0FF",
              border:       "1px solid rgba(255,255,255,0.08)",
              fontFamily:   "'DM Sans', sans-serif",
              fontSize:     "13px",
              borderRadius: "10px",
              maxWidth:     "400px",
              padding:      "12px 16px",
            },
            success: { iconTheme: { primary: "#1A9E6F", secondary: "#0D2137" }, duration: 3000 },
            error:   { iconTheme: { primary: "#D64045", secondary: "#0D2137" }, duration: 4000 },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}