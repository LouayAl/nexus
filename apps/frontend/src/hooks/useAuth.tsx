"use client";

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, setToken, removeToken, type User } from "@/lib/api";

interface AuthState {
  user:    User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    authApi.me()
      .then(({ data }) => setState({ user: data, loading: false }))
      .catch(()        => setState({ user: null, loading: false }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setToken(data.access_token);
    setState({ user: data.user, loading: false });
    const dest =
      data.user.role === "ADMIN"      ? "/admin"             :
      data.user.role === "ENTREPRISE" ? "/company/dashboard" :
      "/discover";
    router.push(dest);
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setState({ user: null, loading: false });
    router.push("/auth/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}