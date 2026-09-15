import type { ReactNode } from "react";

import { useApiResource } from "../http";
import { fetchDashboardData } from "./dashboardService";
import { DashboardContext } from "./useDashboard";

/** Provee `useDashboard()` al árbol del Dashboard (ver `useDashboard.ts`). */
export function DashboardScope({ children }: { children: ReactNode }) {
    const state = useApiResource(fetchDashboardData);
    return <DashboardContext.Provider value={state}>{children}</DashboardContext.Provider>;
}
