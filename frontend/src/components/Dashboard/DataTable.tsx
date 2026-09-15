import { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table";

import type { Pos } from "@/services/pos/posService";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/services/dashboard/useDashboard";
import {
  PRIORITIES,
  POS_STATUSES,
  POS_STATUS_META,
  PRIORITY_META,
  QUALITY_TONE,
  coverageToPercent,
  metaFor,
  scoreTone,
  type ScoreMetric,
  type Tone,
  toneClass,
} from "@/constants";
import { cn } from "@/lib/utils";

// ─── Celdas reutilizables ──────────────────────────────────────────────────────

const EmptyValue = () => <span className="ui-empty-value">N/A</span>;

function ToneBadge({ tone, children }: { tone: Tone; children: string }) {
  return (
    <Badge className={toneClass(tone, "badge")} variant="outline">
      {children}
    </Badge>
  );
}

function ScoreBar({ value, metric, suffix = "" }: { value: number; metric: ScoreMetric; suffix?: string }) {
  const tone = scoreTone(value, metric);
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="ui-progress-track">
        <div className={cn("h-full rounded-full", toneClass(tone, "bar"))} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-xs font-semibold", toneClass(tone, "text"))}>{value}{suffix}</span>
    </div>
  );
}

// ─── Custom filters ────────────────────────────────────────────────────────────

const nombreFilterFn: FilterFn<Pos> = (row, columnId, filterValue) =>
  row.getValue<string>(columnId).toLowerCase().includes((filterValue as string).toLowerCase());

const municipioFilterFn: FilterFn<Pos> = (row, columnId, filterValue) =>
  row.getValue<string>(columnId) === filterValue;

// ─── Columns ───────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Pos>();

const columns = [
  columnHelper.accessor("name", {
    header: "NOMBRE",
    filterFn: nombreFilterFn,
    cell: (info) => (
      <div className="flex flex-col min-w-[180px]">
        <span className="text-sm font-semibold text-slate-800">{info.getValue()}</span>
        <span className="text-xs text-slate-400">{info.row.original.id}</span>
      </div>
    ),
  }),
  columnHelper.accessor("municipio", {
    header: "MUNICIPIO",
    filterFn: municipioFilterFn,
    cell: (info) => (
      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "TELEFONO",
    cell: (info) => {
      const raw = info.getValue();
      if (raw === null) return <EmptyValue />;
      return <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{raw}</span>;
    },
  }),
  columnHelper.accessor("NIT", {
    header: "NIT",
    cell: (info) => {
      const raw = info.getValue();
      if (raw === null) return <EmptyValue />;
      return <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{raw}</span>;
    },
  }),
  columnHelper.accessor("address", {
    header: "DIRECCIÓN",
    cell: (info) => {
      const raw = info.getValue();
      if (raw === null) return <EmptyValue />;
      return <span className="text-sm text-slate-500 min-w-[140px] block">{raw}</span>;
    },
  }),
  columnHelper.accessor("size", {
    header: "TAMAÑO",
    cell: (info) => {
      const raw = info.getValue();
      if (raw === null) return <EmptyValue />;
      return <span className="text-sm text-slate-600">{raw}</span>;
    },
  }),
  columnHelper.accessor("priority", {
    header: "PRIORIDAD",
    filterFn: "equalsString",
    cell: (info) => (
      <ToneBadge tone={metaFor(PRIORITY_META, info.getValue(), PRIORITY_META.Baja).tone}>{info.getValue()}</ToneBadge>
    ),
  }),
  columnHelper.accessor("coverage", {
    header: "COBERTURA",
    cell: (info) => {
      // coverage puede ser null en /api/map/getAllPos
      const percent = coverageToPercent(info.getValue());
      return percent === null ? <EmptyValue /> : <ScoreBar value={percent} metric="coverage" suffix="%" />;
    },
  }),
  columnHelper.accessor("confidence", {
    header: "CONFIANZA",
    cell: (info) => <ScoreBar value={info.getValue()} metric="confidence" />,
  }),
  columnHelper.accessor("quality", {
    header: "CALIDAD",
    cell: (info) => <ToneBadge tone={metaFor(QUALITY_TONE, info.getValue(), QUALITY_TONE.Baja)}>{info.getValue()}</ToneBadge>,
  }),
  columnHelper.accessor("status", {
    header: "ESTADO",
    filterFn: "equalsString",
    cell: (info) => (
      <ToneBadge tone={metaFor(POS_STATUS_META, info.getValue(), POS_STATUS_META.INACTIVO).tone}>{info.getValue()}</ToneBadge>
    ),
  }),
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function PosTable() {
  const { data } = useDashboard();
  const pos = useMemo(() => data?.ferreterias ?? [], [data]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [nombreSearch, setNombreSearch] = useState("");

  // Municipios únicos derivados de las ferreterías
  const uniqueMunicipios = useMemo(
    () => [...new Set(pos.map((f) => f.municipio))].sort(),
    [pos]
  );

  const table = useReactTable({
    data: pos,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const handleNombreSearch = (value: string) => {
    setNombreSearch(value);
    table.getColumn("name")?.setFilterValue(value || undefined);
  };

  const totalFiltered = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-6 pt-8">

      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="ui-section-title">Base de ferreterías</h2>
          <p className="text-sm text-slate-400 mt-1">
            {totalFiltered} {totalFiltered === 1 ? "registro" : "registros"} encontrados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Búsqueda por nombre */}
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={nombreSearch}
            onChange={(e) => handleNombreSearch(e.target.value)}
            className="w-52"
          />

          {/* Filtro municipio — derivado del JSON */}
          <Select
            value={(table.getColumn("municipio")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("municipio")?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos los municipios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los municipios</SelectItem>
              {uniqueMunicipios.map((z) => (
                <SelectItem key={z} value={z}>{z}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro estado */}
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {POS_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro prioridad */}
          <Select
            value={(table.getColumn("priority")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("priority")?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda prioridad</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      </div>

      {/* ── Table ── */}
      <div className="ui-table">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="ui-table-header-row">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="ui-table-head whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="ui-table-empty ui-table-empty-lg"
                  >
                    No hay ferreterías que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="ui-table-footer">
          <Pagination>
            <PaginationContent className="justify-end gap-4">
              <span className="ui-table-page-label">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
              </span>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  aria-disabled={!table.getCanPreviousPage()}
                  className="ui-pager"
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  aria-disabled={!table.getCanNextPage()}
                  className="ui-pager"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

export default PosTable;