/**
 * routes/routes.tsx
 *
 * Único punto de definición de las rutas de la app: la pública (`/login`) y
 * las tres autenticadas (`/mapa-interactivo`, `/control-operativo`,
 * `/dashboard`). Antes la autenticación decidía A NIVEL DE `App.tsx` si se
 * montaba `<Login>` o el router completo; ahora el router vive siempre
 * montado y cada rama decide por sí misma si te deja pasar, apoyándose en
 * `useAuth()` (mismo `status: loading | authenticated | unauthenticated` de
 * `AuthProvider`). Así `/login` puede convivir con las rutas protegidas.
 */

import { createBrowserRouter, Navigate } from "react-router-dom";

import { MapDashboard } from "@/components/Mapa_Interactivo";
import { AgentManager } from "@/components/ControlOperativo/AgentManager";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import Login from "@/components/Login/Login";
import { PublicOnly, RequireAuth } from "./guards";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      // Sin pestaña explícita en la URL (`/`) → aterriza en el mapa.
      { index: true, element: <Navigate to="/mapa-interactivo" replace /> },

      { path: "mapa-interactivo", element: <MapDashboard /> },
      { path: "control-operativo", element: <AgentManager /> },
      { path: "dashboard", element: <Dashboard /> },

      // Cualquier ruta desconocida también vuelve al mapa en vez de 404.
      { path: "*", element: <Navigate to="/mapa-interactivo" replace /> },
    ],
  },
]);
