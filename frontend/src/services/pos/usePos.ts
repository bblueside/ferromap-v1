/**
 * services/pos/usePos.ts
 *
 * Comparte los datos del Mapa Interactivo con el árbol del mapa: un único
 * fetch a `/api/map/*` por recurso, consumido por `HeatCircleMarkers`,
 * `LayerGeoJson`, `Sidebar` y `SearchZones`. `PosScope` (en `PosScope.tsx`)
 * se monta en `AppProviders` (sólo la pestaña del mapa), así que no se
 * dispara en las otras pestañas.
 *
 * Ferreterías/zonas, plantas/centros y rutas son peticiones independientes,
 * cada una con su propio `loading/error`: si fallan las capas, el mapa sigue
 * mostrando las ferreterías.
 */

import { createContext, useContext } from "react";

import type { Factory, Pos, RouteDoc, Warehouse, zone } from "./posService";

export interface PosData {
    ferreterias: Pos[];
    zones: zone[];
    loading: boolean;
    error: string | null;
    /** Plantas productoras (`/getAllFactories`). */
    factories: Factory[];
    /** Centros de distribución (`/getAllWarehouse`). */
    warehouses: Warehouse[];
    layersLoading: boolean;
    layersError: string | null;
    /** Rutas logísticas agrupadas por ciudad (`/getAllRoutes`). */
    routes: RouteDoc[];
    routesLoading: boolean;
    routesError: string | null;
    refetch: () => void;
}

export const PosContext = createContext<PosData | null>(null);

export function usePos(): PosData {
    const ctx = useContext(PosContext);
    if (!ctx) throw new Error("usePos debe usarse dentro de <PosScope>");
    return ctx;
}
