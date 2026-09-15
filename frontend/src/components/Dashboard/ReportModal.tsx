import { useState, useMemo } from "react";
import { FileText, Sheet, Download, Calendar, MapPin, CheckSquare, type LucideIcon } from "lucide-react";

import { useDashboard } from "@/services/dashboard/useDashboard";
import { ModalShell } from "@/components/shared/modal/ModalShell";
import { ChoiceButton, FieldLabel, ModalButton, SummaryList, SummaryRow } from "@/components/shared/modal/modalPrimitives";
import { COMPLETENESS_LEVELS, COMPLETENESS_META, type CompletenessLevel, toneClass } from "@/constants";
import { cn } from "@/lib/utils";

// ── Data ───────────────────────────────────────────────────────────────────

type OutputFormat = "pdf" | "excel" | "csv";

/** Formatos de salida; solo CSV está disponible por ahora. */
const OUTPUT_FORMATS: { value: OutputFormat; label: string; icon: LucideIcon; enabled: boolean }[] = [
    { value: "pdf", label: "PDF", icon: FileText, enabled: false },
    { value: "excel", label: "Excel", icon: Sheet, enabled: false },
    { value: "csv", label: "CSV", icon: FileText, enabled: true },
];

const INITIAL_COMPLETENESS: Record<CompletenessLevel, boolean> = {
    listos: true,
    contactables: true,
    incompletos: false,
    sin_contacto: false,
};

const DATE_INPUT_BOX = "flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5";
const DATE_INPUT = "w-full bg-transparent text-xs font-medium text-zinc-700 focus:outline-none";

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon size={11} className="text-zinc-400" />
            <FieldLabel>{children}</FieldLabel>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function GenerateReportModal({ onClose }: { onClose: () => void }) {
    const { data } = useDashboard();
    const pos = useMemo(() => data?.ferreterias ?? [], [data]);

    const DEPARTAMENTOS = useMemo(() => [
        "Todos",
        ...[...new Set(
            pos
                .map((f) => f.departamento)
                .filter((d): d is string => Boolean(d))
        )].sort(),
    ], [pos]);

    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [departamento, setDepartamento] = useState("Todos");
    const [completitud, setCompletitud] = useState(INITIAL_COMPLETENESS);
    const [tipoSalida, setTipoSalida] = useState<OutputFormat>("csv");

    const toggleCompletitud = (key: CompletenessLevel) =>
        setCompletitud((prev) => ({ ...prev, [key]: !prev[key] }));

    const selectedCount = Object.values(completitud).filter(Boolean).length;

    const filasReporte =
        departamento === "Todos"
            ? pos
            : pos.filter((f) => f.departamento === departamento);

    const handleGenerar = () => {
        const rows = filasReporte as unknown as Record<string, unknown>[];
        if (rows.length === 0) return;

        const BOM = String.fromCharCode(0xFEFF);
        const columns = Object.keys(rows[0]);
        const cell = (v: unknown) => {
            const s = v == null ? "" : String(v);
            return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const csv = [
            columns.join(";"),
            ...rows.map((r) => columns.map((c) => cell(r[c])).join(";")),
        ].join("\r\n");

        const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `reporte-ferreterias-${departamento.toLowerCase().replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    return (
        <ModalShell
            title="Generar reporte"
            subtitle="FerroInsight · Mercadeo"
            icon={<FileText size={16} className="text-zinc-500" />}
            onClose={onClose}
        >
            <div className="px-5 py-5 space-y-5">

                {/* ── Rango de fechas ── */}
                <div className="space-y-2">
                    <SectionLabel icon={Calendar}>Rango de fechas</SectionLabel>
                    <div className="flex gap-2">
                        <div className={DATE_INPUT_BOX}>
                            <input
                                type="date"
                                aria-label="Fecha inicial"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className={DATE_INPUT}
                            />
                        </div>
                        <span className="flex items-center text-xs text-zinc-400 font-medium">→</span>
                        <div className={DATE_INPUT_BOX}>
                            <input
                                type="date"
                                aria-label="Fecha final"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className={DATE_INPUT}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Departamento ── */}
                <div className="space-y-2">
                    <SectionLabel icon={MapPin}>Departamento / Zona</SectionLabel>
                    <div className="relative">
                        <select
                            value={departamento}
                            onChange={(e) => setDepartamento(e.target.value)}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 focus:outline-none ui-focus-ring"
                        >
                            {DEPARTAMENTOS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
                    </div>
                </div>

                {/* ── Completitud ── */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <SectionLabel icon={CheckSquare}>Completitud del dato</SectionLabel>
                        <span className="text-[11px] text-zinc-400">{selectedCount} seleccionados</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {COMPLETENESS_LEVELS.map((key) => {
                            const { label, color } = COMPLETENESS_META[key];
                            const checked = completitud[key];
                            return (
                                <ChoiceButton
                                    key={key}
                                    selected={checked}
                                    appearance="card"
                                    onClick={() => toggleCompletitud(key)}
                                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
                                >
                                    <span
                                        className={cn("h-2 w-2 shrink-0 rounded-full", !checked && "bg-zinc-200")}
                                        style={checked ? { backgroundColor: color } : undefined}
                                    />
                                    {label}
                                </ChoiceButton>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tipo de salida ── */}
                <div className="space-y-2">
                    <SectionLabel icon={Download}>Tipo de salida</SectionLabel>
                    <div className="flex gap-2">
                        {OUTPUT_FORMATS.map(({ value, label, icon: Icon, enabled }) => (
                            <ChoiceButton
                                key={value}
                                selected={tipoSalida === value}
                                appearance="card"
                                disabled={!enabled}
                                title={enabled ? undefined : "Disponible próximamente — por ahora el reporte se genera en CSV"}
                                onClick={() => setTipoSalida(value)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Icon size={14} className={tipoSalida === value ? toneClass("success", "text") : "text-zinc-300"} />
                                {label}
                            </ChoiceButton>
                        ))}
                    </div>
                </div>

                {/* ── Resumen ── */}
                <SummaryList>
                    <SummaryRow label="Registros estimados" valueClassName="font-semibold text-zinc-700">~{filasReporte.length}</SummaryRow>
                    <SummaryRow label="Formato de salida" valueClassName={cn("font-semibold uppercase", "ui-accent-text")}>{tipoSalida}</SummaryRow>
                </SummaryList>

                {/* ── Actions ── */}
                <div className="flex gap-2.5 pt-1">
                    <ModalButton variant="brand" onClick={handleGenerar} className="flex-1 font-semibold">
                        <Download size={14} />
                        Generar reporte
                    </ModalButton>
                    <ModalButton variant="outline" className="px-4" onClick={onClose}>
                        Cancelar
                    </ModalButton>
                </div>

            </div>
        </ModalShell>
    );
}
