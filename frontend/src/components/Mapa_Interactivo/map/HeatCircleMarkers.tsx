import { useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import {
  circleOptions,
  getColor,
  getFillOpacity,
  getZoomLevel,
  type ZoomLevel,
  type Priority,
} from "@/utils/heatCircleUtils";
import { MAP_COLORS } from "@/constants";
import { dbscan } from "@/lib/clustering";
import type { ClusterPoint } from "@/lib/clustering";
import { useReactLeafletPopups } from "@/lib/useReactLeafletPopups";
import type { BindPopup } from "@/lib/useReactLeafletPopups";
import { useSelection } from "@/lib/useSelection";
import { useFilters } from "@/lib/useFilterState";
import { usePos } from "@/services/pos/usePos";
import { HeatCirclePopup, PosPopup } from "../popups";
import type { Pos, zone } from "@/services/pos/posService";

const EPS_DEGREES = 0.05;
const MIN_PTS = 2;

// ─── Contexto que reciben los renderers de cada nivel de zoom ────────────────

interface RenderCtx {
  map: L.Map;
  /**
   * Ferreterías que YA pasaron los filtros de atributo (tamaño, tipo, estado,
   * fuente) y de zona geográfica — vía `getFilteredPos` de
   * `useFilterState`, la única fuente de verdad del filtrado. Aquí sólo queda
   * por resolver la prioridad, que se comprueba contra la ZONA
   * (`card.priority`), no contra `f.priority`.
   */
  pos: Pos[];
  zonas: zone[];
  zonaById: Map<string, zone>;
  zonaIdsEnCiudades: Set<string>;
  selectedZones: Set<string>;
  visiblePriorities: Set<Priority>;
  setSelectedId: (id: string | null) => void;
  bindPopup: BindPopup;
}

// ─── ZOOM 1: un círculo por zona ────────────────────────────────────────────
function buildZoom1Layers(ctx: RenderCtx): L.Layer[] {
  const layers: L.Layer[] = [];

  ctx.zonas.forEach((card) => {
    if (!ctx.visiblePriorities.has(card.priority)) return;
    if (ctx.selectedZones.size > 0 && !ctx.zonaIdsEnCiudades.has(card.id)) return;

    const circle = L.circleMarker([card.lat, card.lng], circleOptions(card.priority, 1));
    circle.bindTooltip(card.name, { direction: "top", offset: [0, -8] });
    ctx.bindPopup(circle, {
      minWidth: 300,
      maxWidth: 400,
      render: () => <HeatCirclePopup zone={card} />,
    });
    circle.on("click", () => {
      ctx.setSelectedId(card.id);
      circle.openPopup();
    });
    circle.addTo(ctx.map);
    layers.push(circle);
  });
  return layers;
}

// ─── ZOOM 2: clusters DBSCAN por zona ──────────────────────────────────────
function buildZoom2Layers(ctx: RenderCtx): L.Layer[] {
  const layers: L.Layer[] = [];

  const ferretsByZone = new Map<string, ClusterPoint[]>();
  ctx.pos.forEach((f) => {
    const card = ctx.zonaById.get(f.zonaId);
    if (!card || !ctx.visiblePriorities.has(card.priority)) return;
    if (!ferretsByZone.has(f.zonaId)) ferretsByZone.set(f.zonaId, []);
    ferretsByZone.get(f.zonaId)!.push({ lat: f.lat, lng: f.lng });
  });

  ferretsByZone.forEach((points, zonaId) => {
    const card = ctx.zonaById.get(zonaId)!;
    dbscan(points, EPS_DEGREES, MIN_PTS).forEach((cluster) => {
      const circle = L.circleMarker(
        [cluster.lat, cluster.lng],
        circleOptions(card.priority, 2)
      );
      circle.bindTooltip(`${card.name} · ${cluster.count} ferreterías`, {
        direction: "top",
        offset: [0, -8],
      });
      ctx.bindPopup(circle, {
        minWidth: 300,
        maxWidth: 400,
        render: () => <HeatCirclePopup zone={card} />,
      });
      circle.on("click", () => {
        ctx.setSelectedId(card.id);
        circle.openPopup();
      });
      circle.addTo(ctx.map);
      layers.push(circle);
    });
  });
  return layers;
}

// ─── ZOOM 3: marcador individual por ferretería ────────────────────────────
function buildZoom3Layers(ctx: RenderCtx): L.Layer[] {
  const layers: L.Layer[] = [];

  ctx.pos.forEach((f) => {
    const card = ctx.zonaById.get(f.zonaId);
    if (!card || !ctx.visiblePriorities.has(card.priority)) return;

    const circle = L.circleMarker([f.lat, f.lng], {
      radius: 6,
      fillColor: getColor(card.priority),
      color: MAP_COLORS.markerStroke,
      weight: 1.5,
      fillOpacity: getFillOpacity(3),
    });
    circle.bindTooltip(f.name, {
      direction: "top",
      offset: [0, -6],
    });
    ctx.bindPopup(circle, {
      minWidth: 220,
      maxWidth: 300,
      render: () => <PosPopup ferreteria={f} />,
    });
    circle.on("click", () => circle.openPopup());
    circle.addTo(ctx.map);
    layers.push(circle);
  });
  return layers;
}

const ZOOM_RENDERERS: Record<ZoomLevel, (ctx: RenderCtx) => L.Layer[]> = {
  1: buildZoom1Layers,
  2: buildZoom2Layers,
  3: buildZoom3Layers,
};

// ─── Componente ────────────────────────────────────────────────────────────

export function HeatCircleMarkers() {
  const map = useMap();
  const { setSelectedId } = useSelection();
  // Ferreterías y zonas: endpoints dedicados /api/map/* (ver services/pos).
  const { ferreterias: rawPos, zones: ZONAS } = usePos();
  const { visiblePriorities, selectedZones, getFilteredPos } = useFilters();

  // Filtros de atributo (tamaño, tipo, estado, fuente) + zona geográfica: una
  // sola implementación, en useFilterState. `ignorePriority` porque en el mapa
  // la prioridad se resuelve contra la ZONA, no contra la ferretería.
  const pos = useMemo(
    () => getFilteredPos(rawPos, { ignorePriority: true }),
    [getFilteredPos, rawPos]
  );

  const zonaById = useMemo(
    () => new Map<string, zone>(ZONAS.map((z) => [z.id, z])),
    [ZONAS]
  );

  // Zonas con al menos una ferretería en los municipios seleccionados. Se
  // calcula sobre la lista SIN filtrar por atributos: el círculo de zona
  // depende de que el municipio tenga ferreterías, no de los filtros activos.
  const zonaIdsEnCiudades = useMemo<Set<string>>(() => {
    if (selectedZones.size === 0) return new Set();
    const ids = new Set<string>();
    rawPos.forEach((f) => {
      if (selectedZones.has(f.municipio)) ids.add(f.zonaId);
    });
    return ids;
  }, [rawPos, selectedZones]);

  const layersRef = useRef<L.Layer[]>([]);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(getZoomLevel(map.getZoom()));
  const { bind, portals, reset } = useReactLeafletPopups();

  useEffect(() => {
    const handleZoomEnd = () => setZoomLevel(getZoomLevel(map.getZoom()));
    map.on("zoomend", handleZoomEnd);
    return () => { map.off("zoomend", handleZoomEnd); };
  }, [map]);

  useEffect(() => {
    if (ZONAS.length === 0) return;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];
    reset();

    layersRef.current = ZOOM_RENDERERS[zoomLevel]({
      map,
      pos,
      zonas: ZONAS,
      zonaById,
      zonaIdsEnCiudades,
      selectedZones,
      visiblePriorities,
      setSelectedId,
      bindPopup: bind,
    });

    return () => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
      reset();
    };
  }, [
    map, zoomLevel, setSelectedId, bind, reset,
    ZONAS, pos, zonaById, zonaIdsEnCiudades,
    visiblePriorities, selectedZones,
  ]);

  return <>{portals}</>;
}
