import { createColumnHelper } from "@tanstack/react-table";
import { formatTimestamp, type HistoryRow } from "../domain/executionHistory";
import { ExecutionStatusBadge } from "./ExecutionStatusBadge";

const column = createColumnHelper<HistoryRow>();

/** Columnas del historial. Los `id` "agent" y "status" son los filtros de `<Select>`. */
export const historyColumns = [
  column.accessor("status", {
    header: "ESTADO",
    filterFn: "equalsString",
    cell: (info) => <ExecutionStatusBadge status={info.getValue()} />,
  }),
  column.accessor("agent", {
    header: "AGENTE",
    filterFn: "equalsString",
    cell: (info) => <span className="text-xs font-semibold text-slate-700">{info.getValue()}</span>,
  }),
  column.accessor("taskId", {
    header: "TASK ID",
    cell: (info) => <span className="block max-w-[220px] font-semibold text-slate-700">{info.getValue()}</span>,
  }),
  column.accessor("createdAt", {
    header: "FECHA Y HORA",
    cell: (info) => <span className="text-slate-700">{formatTimestamp(info.getValue())}</span>,
  }),
];
