// src/app/admin/_hooks/useAdminData.ts
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

const STALE = 90_000; // 90s — data stays fresh, no re-fetch on tab switch

export function useAdminPending() {
  return useQuery({
    queryKey:  ["admin-pending"],
    queryFn:   () => adminApi.getPending().then(r => r.data),
    staleTime: STALE,
  });
}

export function useAdminEntreprises(enabled = true) {
  return useQuery({
    queryKey:  ["admin-entreprises"],
    queryFn:   () => adminApi.getAllEntreprises().then(r => r.data),
    enabled,
    staleTime: STALE,
  });
}

export function useAdminCandidats(enabled = true) {
  return useQuery({
    queryKey:  ["admin-candidats"],
    queryFn:   () => adminApi.getAllCandidats().then(r => r.data),
    enabled,
    staleTime: STALE,
  });
}