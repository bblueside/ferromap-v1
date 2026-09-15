/** Filtros del preview de datos normalizados. Sin React. */

import type { MatchStatus } from "@/constants";
import type { NormalizedRow } from "@/services/control/normalizationPreviewService";

export type PreviewFilter = "all" | "new" | "match";

export const PREVIEW_FILTER_OPTIONS: { value: PreviewFilter; label: string }[] = [
  { value: "all", label: "Todos los registros" },
  { value: "new", label: "Solo nuevos" },
  { value: "match", label: "Solo matches" },
];

export const isMatch = (row: NormalizedRow) => Boolean(row.matchedId);

export const matchStatus = (row: NormalizedRow): MatchStatus => (isMatch(row) ? "match" : "new");

export function filterPreviewRows(rows: NormalizedRow[], filter: PreviewFilter): NormalizedRow[] {
  if (filter === "new") return rows.filter((row) => !isMatch(row));
  if (filter === "match") return rows.filter(isMatch);
  return rows;
}
