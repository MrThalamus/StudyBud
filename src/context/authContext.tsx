import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as authApi from "../api/auth";
import { getToken, setToken, clearToken } from "../api/token";
import type { CurrentUser } from "../types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (getToken()) {
        try {
          setUser(await authApi.getMe());
        } catch {
          clearToken();
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  async function login(email: string, password: string) {
    const token = await authApi.login(email, password);
    setToken(token);
    setUser(await authApi.getMe());
  }

  async function register(
    name: string,
    username: string,
    email: string,
    password1: string,
    password2: string,
  ) {
    const token = await authApi.register(
      name,
      username,
      email,
      password1,
      password2,
    );
    setToken(token);
    setUser(await authApi.getMe());
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
