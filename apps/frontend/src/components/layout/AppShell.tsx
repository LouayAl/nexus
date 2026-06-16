"use client";

import { TopNav } from "@/components/layout/TopNav";

export function AppShell({ children, pageTitle, fullWidth = false }: {
  children: React.ReactNode;
  pageTitle: string;
  fullWidth?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopNav pageTitle={pageTitle} />
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        <main className="animate-fade-up" style={{ flex: 1, overflowX: "hidden", minWidth: 0 }}>
          {fullWidth ? children : (
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "var(--page-py) var(--page-px)",
              }}
            >
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
