/**
 * Forma de un agente de Control Operativo. El catálogo de agentes vive en
 * `agents/agentCatalog.tsx`.
 */

import type { ReactNode } from "react";
import type { AgentStatus } from "@/constants";

/** Fila de la cuadrícula en la que se pinta la tarjeta. */
export type AgentLayoutGroup = "primary" | "secondary";

/**
 * Tipo de tarjeta: `standard` (auto, admin, exportar, subir → ejecutar) o
 * `inputData` (subir → preview de datos normalizados → confirmar carga).
 */
export type AgentVariant = "standard" | "inputData";

export interface Agent {
    id: string;
    name: string;
    status: AgentStatus;
    task: string;
    auto: boolean;
    layoutGroup: AgentLayoutGroup;
    variant: AgentVariant;
    hasUpload?: boolean;
    icon: ReactNode;
    hasExport?: boolean;
    file?: string;
}
