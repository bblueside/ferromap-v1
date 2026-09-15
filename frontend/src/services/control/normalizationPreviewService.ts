/**
 * services/control/normalizationPreviewService.ts
 *
 * Flujo de carga del "Input Data Agent": el archivo subido se normaliza, se
 * previsualiza contra el mapa y el usuario confirma la carga.
 *
 * Contrato previsto con el backend (aún no implementado):
 *
 *     POST /api/agents/{agentId}/upload           → { jobId }
 *     GET  /api/agents/{agentId}/preview/{jobId}  → { status, normalized, matches }  (polling cada 2 s)
 *     POST /api/agents/{agentId}/commit/{jobId}   → { ok }
 *
 * Mientras tanto ambas funciones responden con el fixture
 * `fixtures/normalized_data.json`. Este archivo es el único punto a reemplazar
 * cuando el backend exista: los componentes solo conocen estas firmas.
 */

import NORMALIZED_DATA from "./fixtures/normalized_data.json";

/** Fila normalizada por el agente. */
export interface NormalizedRow {
    id: string;
    zonaId: string;
    municipio: string;
    name: string;
    lat: number;
    lng: number;
    status: string | null;
    address: string | null;
    size: string | null;
    confidence: number | null;
    coverage: string | null;
    quality: string | null;
    phone: string | null;
    departamento: string;
    source_url: string | null;
    categoria: string | null;
    NIT: string | null;
    /** Si existe, el registro coincide con un cliente ya presente en el mapa. */
    matchedId?: string;
}

export interface MatchSummary {
    /** Filas del archivo subido. */
    total: number;
    /** Registros que no estaban en el mapa (se crearán). */
    newRecords: number;
    /** Registros que coinciden con clientes existentes (se actualizarán). */
    matched: number;
    /** Filas que el agente no pudo normalizar. */
    invalid: number;
}

export interface NormalizationPreview {
    fileName: string;
    rows: NormalizedRow[];
    summary: MatchSummary;
}

const MOCK_LATENCY_MS = 1200;

function summarize(rows: NormalizedRow[]): MatchSummary {
    const matched = rows.filter((row) => row.matchedId).length;
    return { total: rows.length, newRecords: rows.length - matched, matched, invalid: 0 };
}

/** Preview de normalización de `file` para el agente `agentId`. */
export async function fetchNormalizationPreview(
    _agentId: string,
    file: File
): Promise<NormalizationPreview> {
    const rows = NORMALIZED_DATA as NormalizedRow[];
    return { fileName: file.name, rows, summary: summarize(rows) };
}

/** Confirma la carga del preview en la base de datos del mapa. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- el mock ignora `agentId`; la firma es la del backend.
export async function commitNormalizationPreview(_agentId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}
