import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterPanel } from "./FilterPanel";
import type { ActiveFilter } from "@/lib/useFilterState";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterItem<T extends string> {
    value: T;
    label: string;
    description?: string;
    /** Color del punto (hex), p. ej. `PRIORITY_META.Alta.hex`. */
    dotColor?: string;
}

interface CheckboxFilterPanelProps<T extends string> {
    filterId: ActiveFilter;
    sidebarWidth: number;
    title: string;
    subtitle?: string;
    items: FilterItem<T>[];
    selected: Set<T>;
    onToggle: (value: T) => void;
    onToggleAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckboxFilterPanel<T extends string>({
    filterId,
    sidebarWidth,
    title,
    subtitle,
    items,
    selected,
    onToggle,
    onToggleAll,
}: CheckboxFilterPanelProps<T>) {
    const allVisible = items.every((item) => selected.has(item.value));

    return (
        <FilterPanel
            filterId={filterId}
            sidebarWidth={sidebarWidth}
            title={title}
            subtitle={subtitle}
            footerText={`${selected.size} de ${items.length} visibles`}
        >
            {/* Select all / clear row */}
            <div className="flex items-center justify-between pb-2">
                <span className="text-[0.68rem] font-medium text-slate-400 uppercase tracking-wide">
                    Opciones
                </span>
                <button
                    onClick={onToggleAll}
                    className="text-[0.68rem] text-slate-400 hover:text-slate-700 transition-colors"
                >
                    {allVisible ? "Limpiar todo" : "Seleccionar todo"}
                </button>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-1">
                {items.map((item) => {
                    const checked = selected.has(item.value);
                    return (
                        <label
                            key={item.value}
                            htmlFor={`filter-${filterId}-${item.value}`}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-2 py-2.5 cursor-pointer",
                                "transition-colors hover:bg-slate-50",
                                !checked && "opacity-50"
                            )}
                        >
                            <Checkbox
                                id={`filter-${filterId}-${item.value}`}
                                checked={checked}
                                onCheckedChange={() => onToggle(item.value)}
                                className="shrink-0"
                            />
                            {item.dotColor && (
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.dotColor }} />
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-[0.78rem] font-medium text-slate-700 leading-tight">
                                    {item.label}
                                </span>
                                {item.description && (
                                    <span className="text-[0.66rem] text-slate-400 leading-tight truncate">
                                        {item.description}
                                    </span>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>
        </FilterPanel>
    );
}