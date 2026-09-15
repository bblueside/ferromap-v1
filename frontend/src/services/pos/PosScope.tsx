import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";

import { useApiResource } from "../http";
import { fetchAllRoutes, fetchMapData, fetchMapLayers } from "./posService";
import type { RouteDoc } from "./posService";
import { PosContext } from "./usePos";
import type { PosData } from "./usePos";

// Referencia estable mientras cargan: `LayerGeoJson` recrea las capas de ruta
// cuando cambia `routes`.
const NO_ROUTES: RouteDoc[] = [];

/** Provee `usePos()` al árbol del mapa (ver `usePos.ts`). */
export function PosScope({ children }: { children: ReactNode }) {
    const map = useApiResource(fetchMapData);
    const layers = useApiResource(fetchMapLayers);
    const routes = useApiResource(fetchAllRoutes);

    const refetchMap = map.refetch;
    const refetchLayers = layers.refetch;
    const refetchRoutes = routes.refetch;
    const refetch = useCallback(() => {
        refetchMap();
        refetchLayers();
        refetchRoutes();
    }, [refetchMap, refetchLayers, refetchRoutes]);

    const value = useMemo<PosData>(
        () => ({
            ferreterias: map.data?.ferreterias ?? [],
            zones: map.data?.zones ?? [],
            loading: map.loading,
            error: map.error,
            factories: layers.data?.factories ?? [],
            warehouses: layers.data?.warehouses ?? [],
            layersLoading: layers.loading,
            layersError: layers.error,
            routes: routes.data ?? NO_ROUTES,
            routesLoading: routes.loading,
            routesError: routes.error,
            refetch,
        }),
        [map, layers, routes, refetch]
    );
    return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}
