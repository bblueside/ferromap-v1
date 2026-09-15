import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthSplash } from "@/components/auth/AuthSplash";
import { useAuth } from "@/services/auth/useAuth";

/**
 * Guard de las rutas protegidas (todo lo que cuelga de "/"). Sin sesión
 * válida, ni `AppLayout` ni sus hijas llegan a montarse.
 */
export function RequireAuth() {
  const { status } = useAuth();

  // Verificando la cookie contra el backend: ni la app ni el login todavía.
  if (status === "loading") return <AuthSplash />;

  // Sin sesión → a la ruta pública de login, recordando a dónde intentaba ir
  // no hace falta aquí porque tras loguear siempre aterriza en el mapa.
  if (status === "unauthenticated") return <Navigate to="/login" replace />;

  return <AppLayout />;
}

/**
 * Guard de la ruta pública `/login`: si ya hay sesión, no tiene sentido
 * mostrar el formulario de nuevo — se manda directo al mapa.
 */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") return <AuthSplash />;
  if (status === "authenticated") return <Navigate to="/mapa-interactivo" replace />;

  return <>{children}</>;
}
