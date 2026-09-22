/**
 * services/dashboard/dashboardService.ts
 *
 * Datos del Dashboard desde el backend propio (:3000 vía proxy). Cada gráfica
 * sale de su propio endpoint (todos devuelven un arreglo plano):
 *
 *     GET /api/dashboard/getAllKpis            → KPIs (`{ metric, value }`)
 *     GET /api/dashboard/getAllPosCoverage     → ferreterías por completitud
 *     GET /api/dashboard/getAllPosCoverageGap  → TuNegocio vs total por departamento
 *     GET /api/control/getAllAgentRecords      → registros por agente
 *     GET /api/map/getAllTopZones              → zonas de mayor potencial
 *     GET /api/map/getAllPos                   → ferreterías (tabla y reporte)
 *     GET /api/map/getPriorityRanking          → ranking de zonas por prioridad
 *     GET /api/map/getStatusComparison         → ferreterías por estado
 *     GET /api/map/getRegionTotals             → ferreterías por región
 *
 * `fetchDashboardData` los pide en paralelo y los adapta a la forma que
 * consumen las gráficas; los componentes no conocen la forma de cada endpoint.
 */

import { fetchJson } from "../http";
import { fetchAllAgentRecords } from "../control/controlService";
import {
    fetchAllPos,
    fetchAllTopZones,
    fetchPriorityRanking,
    fetchRegionTotals,
    fetchStatusComparison,
} from "../pos/posService";
import type { Pos, PriorityRankingEntry, RegionTotals, StatusComparison, zone } from "../pos/posService";

const DASHBOARD_API_URL =
    (import.meta.env as Record<string, string | undefined>).VITE_DASHBOARD_API_URL ??
    "/api/dashboard";

// ─── Contratos de los endpoints ──────────────────────────────────────────────

export interface KpiEntry {
    metric: string;
    value: number | null;
}

export interface PosCoverageEntry {
    name: string;
    quantity: number | null;
}

export interface PosCoverageGapEntry {
    name: string;
    tunegocio: number | null;
    total: number | null;
}

// ─── Forma que consumen las gráficas ─────────────────────────────────────────

export interface DashboardKpis {
    totalFerreterias: string;
    totalContactos: string;
}

export interface QuantityEntry {
    name: string;
    quantity: number;
}

export interface DashboardData {
    kpis: DashboardKpis;
    ferromapvsferreterias: { name: string; ferromap: number; total: number }[];
    registrosagente: QuantityEntry[];
    coberturaferreteria: QuantityEntry[];
    zones: zone[];
    ferreterias: Pos[];
    priorityRanking: PriorityRankingEntry[];
    statusComparison: StatusComparison;
    regionTotals: RegionTotals;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

/** KPIs → `GET /api/dashboard/getAllKpis`. */
export function fetchAllKpis(): Promise<KpiEntry[]> {
    return fetchJson<KpiEntry[]>(`${DASHBOARD_API_URL}/getAllKpis`, {
        credentials: "include",
    });
}

/** Completitud de ferreterías → `GET /api/dashboard/getAllPosCoverage`. */
export function fetchAllPosCoverage(): Promise<PosCoverageEntry[]> {
    return fetchJson<PosCoverageEntry[]>(`${DASHBOARD_API_URL}/getAllPosCoverage`, {
        credentials: "include",
    });
}

/** Brecha por departamento → `GET /api/dashboard/getAllPosCoverageGap`. */
export function fetchAllPosCoverageGap(): Promise<PosCoverageGapEntry[]> {
    return fetchJson<PosCoverageGapEntry[]>(`${DASHBOARD_API_URL}/getAllPosCoverageGap`, {
        credentials: "include",
    });
}

// ─── Adaptadores ─────────────────────────────────────────────────────────────

function kpiValue(kpis: KpiEntry[], metric: string): string {
    const value = kpis.find((k) => k.metric === metric)?.value;
    return value == null ? "—" : String(value);
}

function toQuantityEntries(rows: { name: string; quantity: number | null }[]): QuantityEntry[] {
    return rows.map((r) => ({ name: r.name, quantity: r.quantity ?? 0 }));
}

/** Todos los datasets del Dashboard en una sola llamada (peticiones en paralelo). */
export async function fetchDashboardData(): Promise<DashboardData> {
    const [
        kpis, coverage, coverageGap, agentRecords, zones, ferreterias, priorityRanking, statusComparison, regionTotals,
    ] = await Promise.all([
        fetchAllKpis(),
        fetchAllPosCoverage(),
        fetchAllPosCoverageGap(),
        fetchAllAgentRecords(),
        fetchAllTopZones(),
        fetchAllPos(),
        fetchPriorityRanking(),
        fetchStatusComparison(),
        fetchRegionTotals(),
    ]);

    return {
        kpis: {
            totalFerreterias: kpiValue(kpis, "totalFerreterias"),
            totalContactos: kpiValue(kpis, "totalContactos"),
        },
        ferromapvsferreterias: coverageGap.map((g) => ({
            name: g.name,
            ferromap: g.tunegocio ?? 0,
            total: g.total ?? 0,
        })),
        registrosagente: toQuantityEntries(agentRecords),
        coberturaferreteria: toQuantityEntries(coverage),
        zones,
        ferreterias,
        priorityRanking,
        statusComparison,
        regionTotals,
    };
}
