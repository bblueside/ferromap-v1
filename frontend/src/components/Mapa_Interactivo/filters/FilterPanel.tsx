import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilters } from "@/lib/useFilterState";
import type { ActiveFilter } from "@/lib/useFilterState";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
    /** ID del filtro al que pertenece este panel (para saber si está abierto) */
    filterId: ActiveFilter;
    /** Ancho actual del Sidebar en px para posicionarse a su lado */
    sidebarWidth: number;
    /** Título principal del panel */
    title: string;
    /** Subtítulo / descripción */
    subtitle?: string;
    /** Texto en el footer (ej. "3 de 3 visibles") */
    footerText?: string;
    /** Contenido del panel (checkboxes, sliders, lo que sea) */
    children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterPanel({
    filterId,
    sidebarWidth,
    title,
    subtitle,
    footerText,
    children,
}: FilterPanelProps) {
    const { activeFilter, setActiveFilter } = useFilters();

    const isOpen = activeFilter === filterId;
    const leftOffset = 16 + sidebarWidth + 8; // left-4 (16px) + sidebarWidth + 8px gap

    return (
        <div
            style={{ left: leftOffset }}
            className={cn(
                "fixed top-24 z-30",
                "w-64 rounded-xl border border-slate-200 bg-white shadow-lg",
                "transition-all duration-300 ease-in-out origin-left",
                isOpen
                    ? "opacity-100 scale-x-100 pointer-events-auto"
                    : "opacity-0 scale-x-95 pointer-events-none"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                    <p className="text-[0.8rem] font-semibold text-slate-800 leading-tight">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-[0.68rem] text-slate-400 mt-0.5">{subtitle}</p>
                    )}
                </div>
                <button
                    onClick={() => setActiveFilter(null)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    aria-label="Cerrar filtros"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Content — each filter owns this */}
            <div className="px-4 pb-4 pt-3">{children}</div>

            {/* Footer */}
            {footerText && (
                <div className="border-t border-slate-100 px-4 py-2">
                    <p className="text-[0.67rem] text-slate-400">{footerText}</p>
                </div>
            )}
        </div>
    );
}