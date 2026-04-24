// frontend/src/hooks/useAuth.tsx 
"use client";

import {
  createContext, useCallback, useContext, useEffect, useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query"; 
import { authApi, type RegisterPayload, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    authApi.me()
      .then(({ data }) => setState({ user: data, loading: false }))
      .catch(() => setState({ user: null, loading: false }));
  }, []);

  const assertValidUser = useCallback(async (user: User) => {
    const allowedRoles = ["CANDIDAT", "ADMIN", "ENTREPRISE"];

    if (!allowedRoles.includes(user.role)) {
      await authApi.logout().catch(() => undefined);
      throw new Error("unauthorized_role");
    }

    return user;
  }, []);

  const login = useCallback(async (email: string, password: string, redirectTo?: string) => {
    const { data } = await authApi.login(email, password);

    const user = await assertValidUser(data.user);

    setState({ user, loading: false });

    // ONLY navigation logic here (not security)
    if (user.role === "ADMIN") {
      router.push("/admin");
      return;
    }

    if (user.role === "ENTREPRISE") {
      router.push("/company/dashboard");
      return;
    }

    router.push("/profile");
  }, [assertValidUser, router]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await authApi.register(payload);

    const user = await assertValidUser(data.user);

    setState({ user, loading: false });

    router.push(
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "ENTREPRISE"
        ? "/company/dashboard"
        : "/profile"
    );
  }, [assertValidUser, router]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Keep the UI signed out even if the cookie is already gone.
    }
    queryClient.clear();
    setState({ user: null, loading: false });
    router.push("/auth/login");
  }, [router, queryClient]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
