import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as authApi from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { getRefreshToken, setTokens, clearTokens } from "../api/token";
import type { CurrentUser } from "../types";
import { AuthContext } from "./auth-context";



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);
  
  useEffect(() => {
    async function init() {
      // The refresh token lasts 7 days; if it exists we may still be logged in
      if (getRefreshToken()) {
        try {
          setUser(await authApi.getMe());
        } catch {
          clearTokens();
        }
      }

      setLoading(false);
    }
    init();
  }, []);

  async function login(email: string, password: string) {
    const data = await authApi.login(email, password);
    setTokens(data.access, data.refresh);
    setUser(data.user); // the server already sent the user, no /users/me/ call
  }


  async function register(
    name: string,
    username: string,
    email: string,
    password1: string,
    password2: string,
  ) {
    const data = await authApi.register(
      name,
      username,
      email,
      password1,
      password2,
    );
    setTokens(data.access, data.refresh);
    setUser(data.user); // the server already sent the user, no /users/me/ call
  }

  async function logout() {
    const refresh = getRefreshToken();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Server couldn't blacklist it (already expired?): log out locally anyway
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  function updateUser(next: CurrentUser) {
    setUser(next);
  }


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
