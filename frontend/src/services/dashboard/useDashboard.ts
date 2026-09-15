/**
 * services/dashboard/useDashboard.ts
 *
 * Comparte los datos del Dashboard con su árbol (gráficas, `PosTable`,
 * `GenerateReportModal`): un único fetch por montaje de la pestaña.
 * `DashboardScope` (en `DashboardScope.tsx`) se monta dentro de `Dashboard`,
 * así que no se dispara en las otras pestañas.
 */

import { createContext, useContext } from "react";

import type { FetchState } from "../http";
import type { DashboardData } from "./dashboardService";

export const DashboardContext = createContext<FetchState<DashboardData> | null>(null);

export function useDashboard(): FetchState<DashboardData> {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error("useDashboard debe usarse dentro de <DashboardScope>");
    return ctx;
}
