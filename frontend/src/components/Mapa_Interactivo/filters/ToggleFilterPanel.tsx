import { cn } from "@/lib/utils";
import { FilterPanel } from "./FilterPanel";
import type { ActiveFilter } from "@/lib/useFilterState";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LayerItem {
    id: string;
    label: string;
    description?: string;
    /** Clase Tailwind de color para el ícono/dot, ej. "bg-orange-500" */
    dotClass?: string;
    /** Emoji o ícono SVG como string */
}

interface ToggleLayerPanelProps {
    filterId: ActiveFilter;
    sidebarWidth: number;
    title: string;
    subtitle?: string;
    items: LayerItem[];
    /** Set con los ids de las capas actualmente visibles */
    visible: Set<string>;
    onToggle: (id: string) => void;
    onToggleAll: () => void;
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
                "transition-colors duration-200 ease-in-out focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                checked ? "bg-slate-700" : "bg-slate-200"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md",
                    "transform transition-transform duration-200 ease-in-out",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ToggleFilterPanel({
    filterId,
    sidebarWidth,
    title,
    subtitle,
    items,
    visible,
    onToggle,
    onToggleAll,
}: ToggleLayerPanelProps) {
    const allVisible = items.every((item) => visible.has(item.id));

    return (
        <FilterPanel
            filterId={filterId}
            sidebarWidth={sidebarWidth}
            title={title}
            subtitle={subtitle}
            footerText={`${visible.size} de ${items.length} capas activas`}
        >
            {/* Header row */}
            <div className="flex items-center justify-between pb-2">
                <span className="text-[0.68rem] font-medium text-slate-400 uppercase tracking-wide">
                    Capas
                </span>
                <button
                    onClick={onToggleAll}
                    className="text-[0.68rem] text-slate-400 hover:text-slate-700 transition-colors"
                >
                    {allVisible ? "Ocultar todo" : "Mostrar todo"}
                </button>
            </div>

            {/* Toggle rows */}
            <div className="flex flex-col gap-1">
                {items.map((item) => {
                    const isVisible = visible.has(item.id);
                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-2 py-2.5",
                                "transition-colors hover:bg-slate-50",
                                !isVisible && "opacity-50"
                            )}
                        >


                            {/* Label */}
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[0.78rem] font-medium text-slate-700 leading-tight">
                                    {item.label}
                                </span>
                                {item.description && (
                                    <span className="text-[0.66rem] text-slate-400 leading-tight truncate">
                                        {item.description}
                                    </span>
                                )}
                            </div>

                            {/* Toggle */}
                            <ToggleSwitch
                                checked={isVisible}
                                onChange={() => onToggle(item.id)}
                            />
                        </div>
                    );
                })}
            </div>
        </FilterPanel>
    );
}