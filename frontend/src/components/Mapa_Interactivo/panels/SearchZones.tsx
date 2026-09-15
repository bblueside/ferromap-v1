import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, MapPin, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFilters } from '@/lib/useFilterState';
import { ApiStateLoading, ApiStateError } from '@/hooks/ApiStateWrapper';
import { usePos } from "@/services/pos/usePos";

export function SearchZones() {
    const { selectedZones, addZone, removeZone, clearZones } = useFilters();
    const { ferreterias: pos, factories, warehouses, loading, error } = usePos();

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Municipios de ferreterías + ciudades de plantas y centros (todo desde la API).
    // Si las capas de instalaciones aún no llegan o fallan, se usan sólo las ferreterías.
    const ALL_MUNICIPIOS = useMemo<string[]>(() => {
        const ciudades = [
            ...pos.map((f) => f.municipio),
            ...factories.map((f) => f.ciudad),
            ...warehouses.map((w) => w.ciudad),
        ].filter((c): c is string => Boolean(c));

        return [...new Set(ciudades)].sort();
    }, [pos, factories, warehouses]);

    const filteredZones = ALL_MUNICIPIOS.filter(
        (m) =>
            m.toLowerCase().includes(query.toLowerCase()) &&
            !selectedZones.has(m)
    ).slice(0, 5);

    const handleSelect = (zone: string) => {
        setQuery("");
        setIsOpen(false);
        addZone(zone);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.length > 0);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return <ApiStateLoading>Cargando municipios...</ApiStateLoading>;
    if (error) return <ApiStateError>{error}</ApiStateError>;

    const activeZones = Array.from(selectedZones);
    const hasActiveZones = activeZones.length > 0;

    return (
        <div className="fixed top-24 right-20 z-40 w-72 md:w-80 pointer-events-auto" ref={dropdownRef}>
            {/* ── Search Input ── */}
            <div className="relative">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                        placeholder="Busca por municipio..."
                        value={query}
                        onChange={handleChange}
                        onFocus={() => query.length > 0 && setIsOpen(true)}
                        className="bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl pl-9 pr-8"
                    />
                    {query.length > 0 && (
                        <button
                            onClick={() => { setQuery(""); setIsOpen(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ── Search Dropdown ── */}
                {isOpen && filteredZones.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="py-2">
                            <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Municipios
                            </p>
                            {filteredZones.map((zone) => (
                                <button
                                    key={zone}
                                    onClick={() => handleSelect(zone)}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                                >
                                    <span className="flex items-center gap-2">
                                        <MapPin size={13} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                        {zone}
                                    </span>
                                    <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Agregar
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {isOpen && filteredZones.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl p-4 text-center shadow-lg z-50">
                        <p className="text-sm text-slate-400">No se encontraron municipios</p>
                    </div>
                )}
            </div>

            {/* ── Active Filters Panel ── */}
            {hasActiveZones && (
                <div className="mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal size={13} className="text-indigo-400" />
                            <div>
                                <p className="text-[0.8rem] font-semibold text-slate-800 leading-tight">
                                    Filtros activos
                                </p>
                                <p className="text-[0.68rem] text-slate-400 mt-0.5">
                                    Municipios seleccionados
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearZones}
                            className="rounded-md px-2 py-1 text-[0.68rem] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            Limpiar todo
                        </button>
                    </div>

                    <div className="px-4 pb-4 pt-3 flex flex-col gap-1">
                        {activeZones.map((zone) => (
                            <div
                                key={zone}
                                className={cn(
                                    "flex items-center justify-between gap-3",
                                    "rounded-lg px-2 py-2.5",
                                    "bg-indigo-50 border border-indigo-100",
                                    "transition-colors hover:bg-indigo-100/70"
                                )}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                    <span className="text-[0.78rem] font-medium text-slate-700 leading-tight truncate">
                                        {zone}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeZone(zone)}
                                    aria-label={`Quitar ${zone}`}
                                    className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-white hover:text-slate-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 px-4 py-2">
                        <p className="text-[0.67rem] text-slate-400">
                            {activeZones.length} {activeZones.length === 1 ? "municipio activo" : "municipios activos"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}