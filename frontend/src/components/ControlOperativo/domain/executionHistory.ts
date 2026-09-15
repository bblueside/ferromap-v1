/**
 * Modelo del historial de ejecuciones: `agents_log` → filas de tabla, estados
 * normalizados y rangos de fecha. Sin React.
 */

import type { AgentLog } from "@/services/control/controlService";
import { PIPELINE_STATUS, type ExecutionStatus } from "@/constants";

/** Fila que consume TanStack Table. Relación 1-a-1 con `agents_log` (`run_id`). */
export type HistoryRow = {
  status: ExecutionStatus;
  agent: string;
  taskId: string;
  /** Epoch en ms: se filtra numéricamente y se formatea solo al pintar. */
  createdAt: number;
};

export type DatePreset = "all" | "7_days" | "15_days" | "30_days" | "90_days" | "custom";

export type DateRange = { start: number | null; end: number | null };

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "Cualquier fecha" },
  { value: "7_days", label: "Últimos 7 días" },
  { value: "15_days", label: "Últimos 15 días" },
  { value: "30_days", label: "Último mes" },
  { value: "90_days", label: "Último trimestre" },
  { value: "custom", label: "Rango personalizado" },
];

const PRESET_DAYS: Partial<Record<DatePreset, number>> = {
  "7_days": 7,
  "15_days": 15,
  "30_days": 30,
  "90_days": 90,
};

const DAY_MS = 86_400_000;

/** Normaliza el `status` libre de `agents_log` a un estado conocido. */
export function toExecutionStatus(status: string): ExecutionStatus {
  switch (status) {
    case PIPELINE_STATUS.queued:
    case PIPELINE_STATUS.running:
    case PIPELINE_STATUS.completed:
    case PIPELINE_STATUS.failed:
      return status;
    case PIPELINE_STATUS.warning:
    case PIPELINE_STATUS.completedWithWarnings:
      return "warning";
    default:
      return "failed";
  }
}

export function toHistoryRows(logs: AgentLog[]): HistoryRow[] {
  return logs.map((log) => ({
    status: toExecutionStatus(log.status),
    agent: log.agent,
    taskId: log.run_id,
    createdAt: new Date(log.createdAt).getTime(),
  }));
}

export function uniqueAgents(rows: HistoryRow[]): string[] {
  return [...new Set(rows.map((row) => row.agent))];
}

/** `dd/mm/yyyy hh:mm` en hora local. */
export function formatTimestamp(epochMs: number): string {
  const d = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Rango de fechas de un preset; `null` = sin filtro. Para `custom`, las fechas
 * `yyyy-mm-dd` de los inputs cubren el día completo.
 */
export function resolveDateRange(
  preset: DatePreset,
  customStart: string,
  customEnd: string,
  now: Date = new Date()
): DateRange | null {
  if (preset === "all") return null;

  if (preset === "custom") {
    return {
      start: customStart ? new Date(`${customStart}T00:00:00`).getTime() : null,
      end: customEnd ? new Date(`${customEnd}T23:59:59`).getTime() : null,
    };
  }

  const start = new Date(now.getTime() - (PRESET_DAYS[preset] ?? 0) * DAY_MS);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
}

export function isWithinRange(epochMs: number, range: DateRange | null | undefined): boolean {
  if (!range) return true;
  if (range.start !== null && epochMs < range.start) return false;
  if (range.end !== null && epochMs > range.end) return false;
  return true;
}
