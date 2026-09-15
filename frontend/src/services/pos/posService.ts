/**
 * services/pos/posService.ts
 *
 * Servicio de los datos del Mapa Interactivo. Endpoints del backend propio
 * (:3000 vía proxy), todos bajo `/api/map` y todos devuelven un arreglo plano
 * (sin envoltorio que desempaquetar):
 *
 *     GET /api/map/getAllPos        → ferreterías (puntos de venta)
 *     GET /api/map/getAllTopZones   → zonas de alto potencial
 *     GET /api/map/getAllFactories  → plantas productoras
 *     GET /api/map/getAllWarehouse  → centros de distribución
 *     GET /api/map/getAllRoutes     → rutas logísticas (GeoJSON)
 */

import type { FeatureCollection, LineString } from "geojson";
import { isPriority, type Priority } from "@/constants";
import { fetchJson } from "../http";

const MAP_API_URL =
    (import.meta.env as Record<string, string | undefined>).VITE_MAP_API_URL ??
    "/api/map";

// ─── Contratos de los endpoints ──────────────────────────────────────────────

/** Ferretería (punto de venta) → `GET /api/map/getAllPos`. */
export interface Pos {
    id: string;
    zonaId: string;
    municipio: string;
    name: string;
    lat: number;
    lng: number;
    status: string;
    address: string;
    priority: Priority;
    size: string;
    confidence: number;
    coverage: null | string;
    quality: string;
    phone: string | null;
    departamento: string;
    source_url: string | null;
    categoria: string;
    NIT: string | null;
    source_agents: string[];
}

/** Zona de alto potencial → `GET /api/map/getAllTopZones`. */
export interface zone {
    id: string;
    name: string;
    ferreterias_count: number;
    priority: Priority;
    potential_score: number;
    analysis: string;
    lat: number;
    lng: number;
}

/*
 * Instalaciones de Ferromap que se pintan como capas del mapa. Reflejan los
 * modelos `factory` y `warehouse` del backend (`backend/src/model/`).
 */

/** Planta productora → `GET /api/map/getAllFactories`. */
export interface Factory {
    _id: string;
    nombre: string;
    planta?: string;
    ciudad?: string;
    departamento?: string;
    longitud: number | null;
    latitud: number | null;
}

/** Centro de distribución → `GET /api/map/getAllWarehouse`. */
export interface Warehouse {
    _id: string;
    node_id: string;
    nombre?: string;
    planta?: string;
    ciudad?: string;
    departamento?: string;
    tipo_cemento?: string;
    node_type?: string;
    status_validation?: string;
    product_focus?: string;
    coordinate_precision?: string;
    confidence_score: number | null;
    address_note: string | null;
    notes: string | null;
    longitud: number | null;
    latitud: number | null;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

/** Ferreterías → `GET /api/map/getAllPos`. */
export function fetchAllPos(): Promise<Pos[]> {
    return fetchJson<Pos[]>(`${MAP_API_URL}/getAllPos`, {
        credentials: "include",
    });
}

/** Zonas de alto potencial → `GET /api/map/getAllTopZones`. */
export function fetchAllTopZones(): Promise<zone[]> {
    return fetchJson<zone[]>(`${MAP_API_URL}/getAllTopZones`, {
        credentials: "include",
    });
}

/** Plantas productoras → `GET /api/map/getAllFactories`. */
export function fetchAllFactories(): Promise<Factory[]> {
    return fetchJson<Factory[]>(`${MAP_API_URL}/getAllFactories`, {
        credentials: "include",
    });
}

/** Centros de distribución → `GET /api/map/getAllWarehouse`. */
export function fetchAllWarehouses(): Promise<Warehouse[]> {
    return fetchJson<Warehouse[]>(`${MAP_API_URL}/getAllWarehouse`, {
        credentials: "include",
    });
}

/** Propiedades de cada ruta (feature) generadas por el pipeline. */
export interface RouteFeatureProps {
    ruta_id: string;
    origen: string;
    lat_origen: number;
    lon_origen: number;
    destino: string;
    lat_destino: number;
    lon_destino: number;
    distancia_km: number;
    tiempo_estimado_min: number;
    num_nodos: number;
    tipo_ruta: string;
    weight_used: string;
    confidence_score: number;
    status: string;
}

/** Grupo de rutas de una ciudad; refleja el modelo `route` del backend. */
export interface RouteDoc {
    _id: string;
    /** Id estable — clave del filtro de rutas y de las capas del mapa. */
    id: string;
    /** Etiqueta legible — "Ciudad — Departamento". */
    label: string;
    /** Municipios que activan esta ruta al seleccionarlos en SearchZones. */
    cities: string[];
    sourceFile: string;
    geojson: FeatureCollection<LineString, RouteFeatureProps>;
}

/** Rutas logísticas → `GET /api/map/getAllRoutes` (ordenadas por `id`). */
export function fetchAllRoutes(): Promise<RouteDoc[]> {
    return fetchJson<RouteDoc[]>(`${MAP_API_URL}/getAllRoutes`, {
        credentials: "include",
    });
}

export interface MapData {
    ferreterias: Pos[];
    zones: zone[];
}

/**
 * Ambos datasets del mapa en una sola llamada (peticiones en paralelo). Descarta
 * los registros con una prioridad desconocida: el mapa no sabría pintarlos.
 */
export async function fetchMapData(): Promise<MapData> {
    const [pos, zones] = await Promise.all([
        fetchAllPos(),
        fetchAllTopZones(),
    ]);
    return {
        ferreterias: pos.filter((f) => isPriority(f.priority)),
        zones: zones.filter((z) => isPriority(z.priority)),
    };
}

export interface MapLayersData {
    factories: Factory[];
    warehouses: Warehouse[];
}

/**
 * Capas de instalaciones (plantas + centros), en paralelo. Va aparte de
 * `fetchMapData` para que un fallo aquí no deje el mapa sin ferreterías.
 */
export async function fetchMapLayers(): Promise<MapLayersData> {
    const [factories, warehouses] = await Promise.all([
        fetchAllFactories(),
        fetchAllWarehouses(),
    ]);
    return { factories, warehouses };
}
