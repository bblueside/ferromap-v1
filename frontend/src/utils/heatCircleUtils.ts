import { MAP_COLORS, PRIORITY_META, type Priority } from "@/constants";

export type { Priority };

/** Nivel de detalle del mapa según el zoom de Leaflet. */
export type ZoomLevel = 1 | 2 | 3;

export function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom < 7) return 1;
  if (zoom <= 11) return 2;
  return 3;
}

// ─── Color ──────────────────────────────────────────────────────────────────
export function getColor(priority: Priority): string {
  return PRIORITY_META[priority].hex;
}

// ─── Radius ─────────────────────────────────────────────────────────────────
export function getRadius(priority: Priority, level: 1 | 2 | 3 | 4): number {
  const table: Record<Priority, [number, number, number]> = {
    Alta: [55, 40, 8],
    Media: [44, 32, 7],
    Baja: [33, 24, 6],
  };
  return table[priority][level - 1];
}

// ─── Fill opacity ────────────────────────────────────────────────────────────
export function getFillOpacity(level: 1 | 2 | 3 | 4): number {
  return [0.5, 0.6, 0.85, 1.0][level - 1];
}

// ─── Shared circle marker options ────────────────────────────────────────────
export function circleOptions(priority: Priority, level: 1 | 2 | 3 | 4) {
  return {
    radius: getRadius(priority, level),
    fillColor: getColor(priority),
    color: MAP_COLORS.markerStroke,
    weight: 1.5,
    fillOpacity: getFillOpacity(level),
  };
}

// ─── buildPopupHTML eliminado ─────────────────────────────────────────────────
// El popup ahora es un componente React: <HeatCirclePopup card={card} />
// Importar desde: ./HeatCirclePopup