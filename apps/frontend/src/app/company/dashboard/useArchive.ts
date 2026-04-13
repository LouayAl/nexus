// frontend/src/app/company/dashboard/useArchive.ts
import { useState, useEffect } from "react";

const KEY = "nexus_archived_offers";

export function useArchive() {
  const [archived, setArchived] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...archived]));
  }, [archived]);

  const archive   = (ids: number[]) => setArchived(prev => new Set([...prev, ...ids]));
  const unarchive = (ids: number[]) => setArchived(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
  const isArchived = (id: number)   => archived.has(id);

  return { archived, archive, unarchive, isArchived };
}