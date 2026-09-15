/**
 * services/control/controlService.ts
 *
 * Datos de Control Operativo desde el backend propio (:3000 vía proxy). Ambos
 * endpoints devuelven un arreglo plano (sin envoltorio):
 *
 *     GET /api/control/getAllAgentsLog     → ejecuciones de agentes (más recientes primero)
 *     GET /api/control/getAllAgentRecords  → registros aportados por cada agente
 */

import { fetchJson } from "../http";

const CONTROL_API_URL =
    (import.meta.env as Record<string, string | undefined>).VITE_CONTROL_API_URL ??
    "/api/control";

/** Una ejecución de agente (colección `agents_log`). */
export interface AgentLog {
    _id: string;
    agent: string;
    run_id: string;
    status: string;
    message: string | null;
    metric_records_in: number | null;
    metric_records_enriched: number | null;
    metric_records_failed: number | null;
    metric_zones_generated: number | null;
    metric_routes_generated: number | null;
    metric_gaps_detected: number | null;
    createdAt: string;
    updatedAt: string;
}

/** Registros aportados por un agente (colección `agent_records`). */
export interface AgentRecord {
    _id: string;
    /** Nombre visible del agente, p. ej. "RAG Agent". */
    name: string;
    quantity: number | null;
}

/** Ejecuciones de agentes → `GET /api/control/getAllAgentsLog`. */
export function fetchAllAgentsLog(): Promise<AgentLog[]> {
    return fetchJson<AgentLog[]>(`${CONTROL_API_URL}/getAllAgentsLog`, {
        credentials: "include",
    });
}

/** Registros por agente → `GET /api/control/getAllAgentRecords`. */
export function fetchAllAgentRecords(): Promise<AgentRecord[]> {
    return fetchJson<AgentRecord[]>(`${CONTROL_API_URL}/getAllAgentRecords`, {
        credentials: "include",
    });
}
