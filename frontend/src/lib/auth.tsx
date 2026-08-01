"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, clearToken, setToken } from "@/lib/api";
import type { ModuleKey, Session } from "@/lib/types";

interface AuthState {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  register: (payload: RegisterPayload) => Promise<Session>;
  logout: () => void;
  refresh: () => Promise<void>;
  hasModule: (m: ModuleKey) => boolean;
}

interface RegisterPayload {
  company_name: string;
  industry?: string;
  admin_name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<Session>("/auth/me");
      setSession(data);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    setToken(res.access_token);
    const data = await api<Session>("/auth/me");
    setSession(data);
    setLoading(false);
    return data;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api<{ access_token: string }>("/auth/register", {
      method: "POST",
      auth: false,
      body: payload,
    });
    setToken(res.access_token);
    const data = await api<Session>("/auth/me");
    setSession(data);
    setLoading(false);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setSession(null);
  }, []);

  const hasModule = useCallback(
    (m: ModuleKey) => !!session?.subscription?.modules.includes(m),
    [session],
  );

  return (
    <AuthContext.Provider value={{ session, loading, login, register, logout, refresh, hasModule }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
