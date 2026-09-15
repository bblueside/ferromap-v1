/**
 * auth/useAuth.ts
 *
 * Contrato del estado de sesión. Los componentes dependen de la abstracción
 * `useAuth()` (DIP), no de `authService` ni de `fetch`; el valor lo provee
 * `AuthProvider`.
 */

import { createContext, useContext } from "react";
import type { AuthUser, LoginCredentials } from "./authService";

// "loading" = todavía no sabemos si la cookie `access_token` sigue siendo
// válida (primer render, antes de que responda `getCurrentUser`).
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
