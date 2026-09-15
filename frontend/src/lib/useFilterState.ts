import { createContext, useContext, useState, useCallback } from "react";
import { CATEGORIA_VALUES, PRIORITIES, MAP_POS_STATUSES, type Priority } from "@/constants";
import type { Pos } from "@/services/pos/posService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActiveFilter =
    | "zonas"
    | "tamano"
    | "tipo"
    | "plantas"
    | "centros"
    | "rutas"
    | "fuentes"
    | "estado"
    | null;

/** Shape of a ferretería entry from `GET /api/map/getAllPos` */

export interface FilterState {
    activeFilter: ActiveFilter;
    setActiveFilter: (filter: ActiveFilter) => void;

    // Búsqueda por zona geográfica (multi-select)
    selectedZones: Set<string>;
    addZone: (zone: string) => void;
    removeZone: (zone: string) => void;
    clearZones: () => void;

    // Zonas de alto potencial
    visiblePriorities: Set<Priority>;
    togglePriority: (value: Priority) => void;
    allPriorities: Priority[];

    // Tamaño del negocio
    visibleTamanos: Set<string>;
    toggleTamano: (value: string) => void;
    allTamanos: string[];

    // Tipo de negocio
    visibleTipos: Set<string>;
    toggleTipo: (value: string) => void;
    allTipos: string[];

    // Fuentes de agentes — valores canónicos: "A1" | "A2" | "A3" | "A4"
    visibleFuentes: Set<string>;
    toggleFuente: (value: string) => void;
    allFuentes: string[];

    // Estado operativo
    visibleEstados: Set<string>;
    toggleEstado: (value: string) => void;
    allEstados: string[];

    // ── Capas del mapa ────────────────────────────────────────────────────────
    showPlantas: boolean;
    togglePlantas: () => void;

    showCentros: boolean;
    toggleCentros: () => void;

    // ── Rutas — control individual por ruta ───────────────────────────────────
    // Los ids vienen de `GET /api/map/getAllRoutes` (`usePos().routes`); este
    // estado no los conoce porque `FilterProvider` se monta fuera de `PosScope`.
    visibleRutas: Set<string>;
    toggleRuta: (id: string) => void;
    /** Muestra todas las rutas de `ids`, u oculta todas si ya lo estaban. */
    toggleAllRutas: (ids: string[]) => void;

    /**
     * Aplica todos los filtros activos a un arreglo de ferreterías.
     * Úsalo en cualquier componente que renderice pins / listas.
     *
     * `opts.ignorePriority` omite el filtro de prioridad. Lo usa
     * `HeatCircleMarkers`, que resuelve la prioridad contra la ZONA
     * (`zone.priority`) y no contra la ferretería (`f.priority`).
     */
    getFilteredPos: (
        pos: Pos[],
        opts?: { ignorePriority?: boolean }
    ) => Pos[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggled<T>(prev: Set<T>, value: T): Set<T> {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const FilterContext = createContext<FilterState | null>(null);

// ─── Hook: produce state (used only by FilterProvider) ───────────────────────

export function useFilterState(): FilterState {
    // ── Valores canónicos — derivados de una única fuente de verdad ──────────
    const ALL_PRIORITIES: Priority[] = [...PRIORITIES];             // constants
    const ALL_TAMANOS = ["Grande", "Mediana", "Pequeña"];
    const ALL_TIPOS: string[] = CATEGORIA_VALUES;                 // constants
    // Valores canónicos que coinciden con source_agents en el JSON
    const ALL_FUENTES = ["A1", "A2", "A3"];
    const ALL_ESTADOS: string[] = MAP_POS_STATUSES;               // constants

    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
    const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

    const [visiblePriorities, setVisiblePriorities] = useState<Set<Priority>>(
        new Set(ALL_PRIORITIES)
    );
    const [visibleTamanos, setVisibleTamanos] = useState<Set<string>>(
        new Set(ALL_TAMANOS)
    );
    const [visibleTipos, setVisibleTipos] = useState<Set<string>>(
        new Set(ALL_TIPOS)
    );
    const [visibleFuentes, setVisibleFuentes] = useState<Set<string>>(
        new Set(ALL_FUENTES)
    );
    const [visibleEstados, setVisibleEstados] = useState<Set<string>>(
        new Set(ALL_ESTADOS)
    );

    // Capas del mapa — ocultas por defecto
    const [showPlantas, setShowPlantas] = useState<boolean>(false);
    const [showCentros, setShowCentros] = useState<boolean>(false);

    // Rutas — ninguna visible por defecto
    const [visibleRutas, setVisibleRutas] = useState<Set<string>>(new Set());

    /**
     * Filtra ferreterías aplicando todos los criterios activos.
     *
     * Lógica de fuentes: una ferretería pasa el filtro si AL MENOS UNO
     * de sus source_agents está en visibleFuentes (OR inclusivo).
     */
    const getFilteredPos = useCallback(
        (
            pos: Pos[],
            opts?: { ignorePriority?: boolean }
        ): Pos[] => {
            return pos.filter((f) => {
                // Prioridad de la ferretería (omitible — ver opts.ignorePriority)
                if (!opts?.ignorePriority && !visiblePriorities.has(f.priority)) return false;

                // Tamaño
                if (!visibleTamanos.has(f.size)) return false;

                // Categoría / tipo
                if (!visibleTipos.has(f.categoria)) return false;

                // Estado operativo
                if (!visibleEstados.has(f.status)) return false;

                // Fuentes (source_agents): pasa si al menos un agente está visible
                const agentMatch = (f.source_agents ?? []).some((agent) =>
                    visibleFuentes.has(agent)
                );
                if (!agentMatch) return false;

                // Zona geográfica (solo filtra si hay zonas seleccionadas)
                if (selectedZones.size > 0 && !selectedZones.has(f.municipio)) return false;

                return true;
            });
        },
        [visiblePriorities, visibleTamanos, visibleTipos, visibleEstados, visibleFuentes, selectedZones]
    );

    return {
        activeFilter,
        setActiveFilter,

        selectedZones,
        addZone: (zone) =>
            setSelectedZones((prev) => {
                if (prev.has(zone)) return prev;
                return new Set(prev).add(zone);
            }),
        removeZone: (zone) =>
            setSelectedZones((prev) => {
                if (!prev.has(zone)) return prev;
                const next = new Set(prev);
                next.delete(zone);
                return next;
            }),
        clearZones: () => setSelectedZones(new Set()),

        visiblePriorities,
        togglePriority: (v) => setVisiblePriorities((p) => toggled(p, v)),
        allPriorities: ALL_PRIORITIES,

        visibleTamanos,
        toggleTamano: (v) => setVisibleTamanos((p) => toggled(p, v)),
        allTamanos: ALL_TAMANOS,

        visibleTipos,
        toggleTipo: (v) => setVisibleTipos((p) => toggled(p, v)),
        allTipos: ALL_TIPOS,

        visibleFuentes,
        toggleFuente: (v) => setVisibleFuentes((p) => toggled(p, v)),
        allFuentes: ALL_FUENTES,

        visibleEstados,
        toggleEstado: (v) => setVisibleEstados((p) => toggled(p, v)),
        allEstados: ALL_ESTADOS,

        showPlantas,
        togglePlantas: () => setShowPlantas((v) => !v),

        showCentros,
        toggleCentros: () => setShowCentros((v) => !v),

        visibleRutas,
        toggleRuta: (id) => setVisibleRutas((p) => toggled(p, id)),
        toggleAllRutas: (ids) =>
            setVisibleRutas((prev) =>
                ids.every((id) => prev.has(id)) ? new Set() : new Set(ids)
            ),

        getFilteredPos,
    };
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

export function useFilters(): FilterState {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
    return ctx;
}