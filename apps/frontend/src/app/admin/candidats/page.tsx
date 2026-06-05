"use client";

import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CandidatsTab } from "../components/CandidatsTab";
import Link from "next/link";

export default function AdminCandidatsPage() {
  return (
    <AppShell pageTitle="Candidats">
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/admin"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5A7A96", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}
        >
          <ArrowLeft size={15} /> Tableau de bord
        </Link>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: "#10406B", letterSpacing: "-0.02em", marginBottom: 4 }}
        >
          Candidats
        </h1>
      </div>

      <CandidatsTab />
    </AppShell>
  );
}