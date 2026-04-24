// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "NEXUS — Recruitment Platform",
  description: "The future of recruitment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <div className="glow-primary" aria-hidden />
          <div className="glow-secondary" aria-hidden />

          <div
            className="nexus-grid-bg"
            style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}