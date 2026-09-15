/**
 * auth/AuthProvider.tsx
 *
 * Expone el estado de sesión a toda la app vía `useAuth()` (en `useAuth.ts`).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "./authService";
import type { AuthUser, LoginCredentials } from "./authService";
import { setUnauthorizedHandler } from "../http";
import { AuthContext } from "./useAuth";
import type { AuthContextValue, AuthStatus } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // ── Rehidratación al montar ────────────────────────────────────────────
  // Al cargar / recargar la página, la cookie httpOnly puede seguir siendo
  // válida aunque este `useState` haya arrancado en blanco. Le preguntamos
  // al backend (`GET /api/users/me`) antes de decidir a qué pantalla entrar.
  // Sin cookie válida → pantalla de login: nunca se inicia sesión sin que el
  // usuario pulse "Iniciar sesión".
  useEffect(() => {
    let cancelled = false;

    authService
      .getCurrentUser()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus(u ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        // Fallo de red al preguntar: tratamos como no autenticado en vez de
        // dejar la app colgada en "loading" para siempre.
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── 401 en cualquier fetch protegido → cerrar sesión localmente ────────
  // Cubre el JWT que vence a mitad de uso (dura 1 h): la próxima llamada a
  // /api/map, /api/dashboard, /api/control, etc. responde 401 y `fetchJson` (en `http.ts`)
  // dispara este handler global en vez de que cada pantalla lo maneje sola.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    if (user) await authService.logout(user.email);
    setUser(null);
    setStatus("unauthenticated");
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
