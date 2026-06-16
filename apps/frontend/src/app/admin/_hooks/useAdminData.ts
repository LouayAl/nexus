import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

const STALE = 90_000;

export function useAdminPending() {
  return useQuery({
    queryKey: ["admin-pending"],
    queryFn:  () => adminApi.getPending().then(r => r.data),
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
    queryFn:   () => adminApi.getAllCandidats({ page: 1, limit: 1 }).then(r => r.data),
    enabled,
    staleTime: STALE,
  });
}
