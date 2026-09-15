import { useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import { MAP_COLORS } from "@/constants";
import { iconPlanta, iconDist } from "./facilityIcons";
import { useFilters } from "@/lib/useFilterState";
import type { Factory, RouteDoc, RouteFeatureProps, Warehouse } from "@/services/pos/posService";
import { usePos } from "@/services/pos/usePos";
import "@/assets/mapStyles.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type BadgeType = "planta" | "dist";

// El catálogo de rutas (id → geojson → ciudades) viene de GET /api/map/getAllRoutes

// ─── Capa de puntos (plantas / centros) ───────────────────────────────────────

// Los textos vienen de la base de datos y Leaflet los inserta como HTML.
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function crearCapaPuntos(
    instalaciones: (Factory | Warehouse)[],
    icon: L.DivIcon,
    badge: BadgeType,
    selectedMunicipios: Set<string>
): L.LayerGroup {
    const capa = L.layerGroup();

    instalaciones.forEach((p) => {
        // Registros sin coordenadas válidas no se pueden ubicar en el mapa.
        if (p.latitud == null || p.longitud == null) return;
        if (selectedMunicipios.size > 0 && !selectedMunicipios.has(p.ciudad ?? "")) return;

        const nombre = escapeHtml(p.nombre ?? "Instalación");
        const marker = L.marker([p.latitud, p.longitud], { icon });

        marker.bindPopup(
            `<div class="popup-title">${nombre}</div>
             <div class="popup-row"><b>Ciudad:</b> ${escapeHtml(p.ciudad ?? "—")}</div>
             <div class="popup-row"><b>Dpto.:</b> ${escapeHtml(p.departamento ?? "—")}</div>
             <span class="popup-badge ${badge === "planta" ? "badge-planta" : "badge-dist"}">
               ${badge === "planta" ? "Planta Productora" : "Centro de Distribución"}
             </span>`,
            { maxWidth: 250, className: "custom-popup" }
        );
        marker.bindTooltip(nombre, {
            direction: "top",
            offset: [0, -10],
            className: "custom-tooltip",
        });
        capa.addLayer(marker);
    });

    return capa;
}

// ─── Capa de rutas ────────────────────────────────────────────────────────────

function crearCapaRuta(data: RouteDoc["geojson"]): L.GeoJSON {
    return L.geoJSON<RouteFeatureProps>(data, {
        style() {
            return {
                color: MAP_COLORS.ruta,
                weight: 3,
                opacity: 0.85,
                dashArray: "6 4",
                lineJoin: "round",
            };
        },
        onEachFeature(feature, featureLayer) {
            const p = feature.properties;
            const rutaId = escapeHtml(String(p.ruta_id));
            featureLayer.bindPopup(
                `<div class="popup-title">${rutaId}</div>
                 <div class="popup-row"><b>Origen:</b> ${escapeHtml(String(p.origen))}</div>
                 <div class="popup-row"><b>Destino:</b> ${escapeHtml(String(p.destino))}</div>
                 <div class="popup-row"><b>Distancia:</b> ${escapeHtml(String(p.distancia_km))} km</div>
                 <div class="popup-row"><b>Tiempo est.:</b> ${escapeHtml(String(p.tiempo_estimado_min))} min</div>
                 <span class="popup-badge badge-ruta">${escapeHtml(String(p.status))}</span>`,
                { maxWidth: 260, className: "custom-popup" }
            );
            featureLayer.bindTooltip(`${rutaId} — ${escapeHtml(String(p.distancia_km))} km`, {
                direction: "top",
                className: "custom-tooltip",
                sticky: true,
            });
        },
    });
}

// ─── Helper: aplica visibilidad ───────────────────────────────────────────────

function applyVisibility(map: L.Map, capa: L.Layer | null, visible: boolean) {
    if (!capa) return;
    if (visible && !map.hasLayer(capa)) {
        capa.addTo(map);
    } else if (!visible && map.hasLayer(capa)) {
        map.removeLayer(capa);
    }
}

/** Municipio → ids de ruta que debe mostrar (derivado de `cities`). */
function buildCityToRoutes(routes: RouteDoc[]): Record<string, string[]> {
    const acc: Record<string, string[]> = {};
    for (const route of routes) {
        for (const city of route.cities) {
            (acc[city] ??= []).push(route.id);
        }
    }
    return acc;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function LayerGeoJson() {
    const map = useMap();
    const { showPlantas, showCentros, visibleRutas, selectedZones } = useFilters();
    // Plantas, centros y rutas: /api/map/getAllFactories, /getAllWarehouse y /getAllRoutes.
    const { factories, warehouses, routes } = usePos();
    const cityToRoutes = useMemo(() => buildCityToRoutes(routes), [routes]);

    const capaProductorasRef = useRef<L.LayerGroup | null>(null);
    const capaDistribucionRef = useRef<L.LayerGroup | null>(null);

    // Un ref por cada ruta — indexado por rutaId
    const rutaCapasRef = useRef<Record<string, L.GeoJSON | null>>({});

    // ── Efecto 1: crear capas de ruta cuando llegan los datos ─────────────────
    // Se crean ocultas; el efecto 5 (que corre después) aplica la visibilidad.
    useEffect(() => {
        routes.forEach((route) => {
            rutaCapasRef.current[route.id] = crearCapaRuta(route.geojson);
        });

        return () => {
            Object.values(rutaCapasRef.current).forEach((c) => c?.remove());
            rutaCapasRef.current = {};
        };
    }, [map, routes]);

    // ── Efecto 2: recrear capas de puntos cuando llegan los datos o cambia selectedZones
    useEffect(() => {
        capaProductorasRef.current?.remove();
        capaDistribucionRef.current?.remove();

        capaProductorasRef.current = crearCapaPuntos(factories, iconPlanta, "planta", selectedZones);
        capaDistribucionRef.current = crearCapaPuntos(warehouses, iconDist, "dist", selectedZones);

        applyVisibility(map, capaProductorasRef.current, showPlantas);
        applyVisibility(map, capaDistribucionRef.current, showCentros);

        return () => {
            capaProductorasRef.current?.remove();
            capaDistribucionRef.current?.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, selectedZones, factories, warehouses]);

    // ── Efecto 3: Plantas ─────────────────────────────────────────────────────
    useEffect(() => {
        applyVisibility(map, capaProductorasRef.current, showPlantas);
    }, [showPlantas, map]);

    // ── Efecto 4: Centros ─────────────────────────────────────────────────────
    useEffect(() => {
        applyVisibility(map, capaDistribucionRef.current, showCentros);
    }, [showCentros, map]);

    // ── Efecto 5: Rutas — respeta visibleRutas y selectedZones ───────────────
    useEffect(() => {
        // Construye el set de rutaIds permitidos por el filtro de ciudad
        const rutasPorCiudad = new Set<string>();
        if (selectedZones.size > 0) {
            selectedZones.forEach((ciudad) => {
                cityToRoutes[ciudad]?.forEach((rid) => rutasPorCiudad.add(rid));
            });
        }

        function isRutaVisible(rutaId: string): boolean {
            if (!visibleRutas.has(rutaId)) return false;
            if (selectedZones.size === 0) return true;
            return rutasPorCiudad.has(rutaId);
        }

        routes.forEach(({ id }) => {
            applyVisibility(
                map,
                rutaCapasRef.current[id] ?? null,
                isRutaVisible(id)
            );
        });
    }, [visibleRutas, selectedZones, map, routes, cityToRoutes]);

    return null;
}