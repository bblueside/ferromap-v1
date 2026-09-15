import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MATCH_STATUS_META, toneClass } from "@/constants";
import type { NormalizedRow } from "@/services/control/normalizationPreviewService";
import { matchStatus } from "../../domain/normalizationPreview";

function MatchBadge({ row }: { row: NormalizedRow }) {
  const { label, tone } = MATCH_STATUS_META[matchStatus(row)];
  return (
    <Badge variant="outline" className={cn(toneClass(tone, "badge"), "text-[11px] font-semibold")}>
      {label}
    </Badge>
  );
}

interface PreviewColumn {
  header: string;
  /** Visibilidad responsive compartida por cabecera y celdas. */
  visibility?: string;
  headClassName?: string;
  cellClassName?: string;
  render: (row: NormalizedRow) => ReactNode;
}

/** Una sola definición por columna: cabecera y celda no pueden desalinearse. */
const COLUMNS: PreviewColumn[] = [
  { header: "ESTADO", headClassName: "w-20", render: (row) => <MatchBadge row={row} /> },
  { header: "NOMBRE", cellClassName: "max-w-[140px] truncate font-medium text-slate-700", render: (row) => row.name },
  {
    header: "DIRECCIÓN",
    visibility: "hidden sm:table-cell",
    cellClassName: "max-w-[160px] truncate text-slate-500",
    render: (row) => row.address,
  },
  { header: "CIUDAD", visibility: "hidden sm:table-cell", cellClassName: "text-slate-500", render: (row) => row.municipio },
  {
    header: "COORDS",
    visibility: "hidden md:table-cell",
    headClassName: "w-28",
    cellClassName: "font-mono text-xs text-slate-400",
    render: (row) => `${row.lat.toFixed(4)}, ${row.lng.toFixed(4)}`,
  },
  { header: "TELEFONO", visibility: "hidden md:table-cell", headClassName: "w-28", cellClassName: "text-slate-500", render: (row) => row.phone },
  { header: "NIT", visibility: "hidden md:table-cell", headClassName: "w-28", cellClassName: "text-slate-500", render: (row) => row.NIT },
];

export function PreviewTable({ rows }: { rows: NormalizedRow[] }) {
  return (
    <div className="ui-table">
      <div className="max-h-56 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="ui-table-header-row">
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.header}
                  className={cn("ui-table-head ui-table-head-compact", column.visibility, column.headClassName)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} className="text-sm">
                  {COLUMNS.map((column) => (
                    <TableCell key={column.header} className={cn(column.visibility, column.cellClassName)}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} className="ui-table-empty">
                  No hay registros con este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
