import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HistoryRow } from "../domain/executionHistory";
import { HistoryPagination } from "./HistoryPagination";

/** Tabla del historial; solo pinta lo que ya calculó `useExecutionHistoryTable`. */
export function HistoryTable({ table }: { table: TanstackTable<HistoryRow> }) {
  const rows = table.getRowModel().rows;

  return (
    <div className="ui-table">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="ui-table-header-row">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="ui-table-head">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllLeafColumns().length} className="ui-table-empty">
                No hay registros que coincidan con los filtros.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <HistoryPagination
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        canPrevious={table.getCanPreviousPage()}
        canNext={table.getCanNextPage()}
        onPrevious={table.previousPage}
        onNext={table.nextPage}
      />
    </div>
  );
}
