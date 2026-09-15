import { useCallback, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { AgentLog } from "@/services/control/controlService";
import {
  isWithinRange,
  resolveDateRange,
  toHistoryRows,
  uniqueAgents,
  type DatePreset,
} from "../domain/executionHistory";
import { historyColumns } from "../history/historyColumns";

const PAGE_SIZE = 5;
const ALL = "all";

/** Columnas filtrables con un `<Select>` cuyo valor "all" desactiva el filtro. */
export type SelectFilterColumn = "agent" | "status";

/**
 * Estado y tabla del historial de ejecuciones. El rango de fechas se aplica
 * sobre los datos antes de la tabla; agente y estado son filtros de columna.
 */
export function useExecutionHistoryTable(logs: AgentLog[] | null) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>(ALL);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const allRows = useMemo(() => toHistoryRows(logs ?? []), [logs]);
  const agentOptions = useMemo(() => uniqueAgents(allRows), [allRows]);

  const rows = useMemo(() => {
    const range = resolveDateRange(datePreset, customStart, customEnd);
    return range ? allRows.filter((row) => isWithinRange(row.createdAt, range)) : allRows;
  }, [allRows, datePreset, customStart, customEnd]);

  const table = useReactTable({
    data: rows,
    columns: historyColumns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const selectFilter = (column: SelectFilterColumn): string =>
    (columnFilters.find((filter) => filter.id === column)?.value as string | undefined) ?? ALL;

  const setSelectFilter = useCallback((column: SelectFilterColumn, value: string) => {
    setColumnFilters((prev) => [
      ...prev.filter((filter) => filter.id !== column),
      ...(value === ALL ? [] : [{ id: column, value }]),
    ]);
  }, []);

  return {
    table,
    agentOptions,
    filters: {
      agent: selectFilter("agent"),
      status: selectFilter("status"),
      datePreset,
      customStart,
      customEnd,
    },
    setSelectFilter,
    setDatePreset,
    setCustomStart,
    setCustomEnd,
  };
}
