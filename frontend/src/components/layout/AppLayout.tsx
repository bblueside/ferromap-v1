import { Outlet } from "react-router-dom";

import { Header } from "@/components/layout/Header";

/**
 * Cascarón visual de la zona autenticada: Header fijo arriba y el contenido
 * de la ruta activa (`<Outlet />`) debajo. Cada pestaña pide sus propios datos
 * (`PosScope` en el mapa, `DashboardScope` en el Dashboard, `AgentManager`
 * en Control Operativo).
 */
export function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
