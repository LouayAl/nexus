import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title:       "NEXUS — Recruitment Platform",
  description: "The future of recruitment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <div className="glow-primary"   aria-hidden />
          <div className="glow-secondary" aria-hidden />
          <div
            className="nexus-grid-bg"
            style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
            aria-hidden
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:  "#080C18",
                color:       "#EDF0FF",
                border:      "1px solid rgba(255,255,255,0.055)",
                fontFamily:  "'Outfit', sans-serif",
                fontSize:    "13px",
                borderRadius:"10px",
              },
              success: { iconTheme: { primary: "#00D49A", secondary: "#080C18" } },
              error:   { iconTheme: { primary: "#FF4F70", secondary: "#080C18" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}