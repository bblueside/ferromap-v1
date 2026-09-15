/**
 * services/pipelineService.ts
 *
 * Escrituras y polling del pipeline multi-agente EXTERNO. Corre en `:5000` y
 * NO está en este repo (ver CLAUDE.md); por eso usa una base absoluta distinta
 * del backend propio del proyecto.
 *
 * Los endpoints `/api/pipeline/run` y `/api/pipeline/run/:code` están inferidos
 * del uso en `AgentManager`; `/api/pipeline/status/:id` viene del antiguo
 * `hooks/callAPI.ts`. Confirmar contra el backend `:5000`.
 *
 * El historial de ejecuciones ya no sale de aquí: se lee de
 * `/api/control/getAllAgentsLog` (ver `services/control`).
 */

import { fetchJson } from "./http";

const PIPELINE_BASE_URL =
    (import.meta.env as Record<string, string | undefined>).VITE_PIPELINE_API_URL ??
    "http://127.0.0.1:5000";

export type AgentCode = "A1" | "A2" | "A2R" | "A3" | "A4" | "A5" | "A6";

export interface RunResponse {
    execution_id?: string;
    status?: string;
    message?: string | null;
    [key: string]: unknown;
}

export interface PipelineStage {
    agent_code?: string;
    status?: string;
    message?: string | null;
    error?: unknown;
}

export interface PipelineStatusResponse {
    execution_id?: string;
    status?: string;
    current_stage?: string | null;
    stages?: PipelineStage[];
    error?: unknown;
}

/** Lanza el pipeline completo. */
export function runAllPipeline(): Promise<RunResponse> {
    return fetchJson<RunResponse>(`${PIPELINE_BASE_URL}/api/pipeline/run`, {
        method: "POST",
    });
}

/** Lanza un único agente. */
export function runSingleAgent(code: AgentCode): Promise<RunResponse> {
    return fetchJson<RunResponse>(`${PIPELINE_BASE_URL}/api/pipeline/run/${code}`, {
        method: "POST",
    });
}

/** Estado de una ejecución (para polling). */
export function getPipelineStatus(
    executionId: string
): Promise<PipelineStatusResponse> {
    return fetchJson<PipelineStatusResponse>(
        `${PIPELINE_BASE_URL}/api/pipeline/status/${executionId}`
    );
}

/** Subida de archivo para un agente (multipart). */
export async function uploadFileToAPI(file: File, agentCode: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("agent_code", agentCode);

    const res = await fetch(`${PIPELINE_BASE_URL}/api/files/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        let errMessage = `Error ${res.status}: ${res.statusText}`;
        try {
            const errData = await res.json();
            if (errData?.error) errMessage = errData.error;
        } catch {
            /* respuesta sin cuerpo JSON */
        }
        throw new Error(errMessage);
    }

    return res.json();
}
