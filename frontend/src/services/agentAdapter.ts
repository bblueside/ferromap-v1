/**
 * services/agentAdapter.ts
 *
 * Traduce el nombre visible de un agente (UI, `components/ControlOperativo/agents/agentCatalog.tsx`) al
 * código que entiende el pipeline (`A1`–`A6`, `A2R`).
 *
 * "Input Data Agent" → "A1" está confirmado por el flujo de subida
 * (`usePipelineRunner.runAfterUpload`).
 * El resto del mapeo es la mejor correspondencia disponible reconstruida desde
 * CLAUDE.md; ajústalo aquí (único sitio) si el backend `:5000` documenta otra.
 */

import type { AgentCode } from "./pipelineService";

const NAME_TO_CODE: Record<string, AgentCode> = {
    "Input Data Agent": "A1",
    "Web Scraper Agent": "A2",
    "Social Media Agent": "A2R",
    "API Agent": "A3",
    "RAG Agent": "A4",
    "Data Organizer Agent": "A5",
};

/** Devuelve el código del pipeline o `null` si el nombre no está mapeado. */
export function getAgentCodeFromName(name: string): AgentCode | null {
    return NAME_TO_CODE[name] ?? null;
}
