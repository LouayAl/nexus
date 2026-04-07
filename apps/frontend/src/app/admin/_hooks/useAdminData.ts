// src/app/admin/_hooks/useAdminData.ts
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export function useAdminPending() {
  return useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => adminApi.getPending().then((r) => r.data),
  });
}

export function useAdminEntreprises(enabled = true) {
  return useQuery({
    queryKey: ["admin-entreprises"],
    queryFn: () => adminApi.getAllEntreprises().then((r) => r.data),
    enabled,
  });
}

export function useAdminCandidats(enabled = true) {
  return useQuery({
    queryKey: ["admin-candidats"],
    queryFn: () => adminApi.getAllCandidats().then((r) => r.data),
    enabled,
  });
}