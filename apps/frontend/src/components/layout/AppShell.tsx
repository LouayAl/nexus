"use client";

import { useState } from "react";
import { TopNav }             from "@/components/layout/TopNav";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";

export function AppShell({ children, pageTitle, fullWidth = false }: {
  children:   React.ReactNode;
  pageTitle:  string;
  fullWidth?: boolean;
}) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <TopNav
        pageTitle={pageTitle}
        notifCount={2}
        notifOpen={notifOpen}
        onNotifClick={() => setNotifOpen(o => !o)}
      />
      <div style={{ display:"flex", flex:1 }}>
        <main className="animate-fade-up" style={{ flex:1, overflowX:"hidden" }}>
          {fullWidth ? children : (
            <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 48px" }}>
              {children}
            </div>
          )}
        </main>
        {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)}/>}
      </div>
    </div>
  );
}