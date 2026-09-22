import { MapContainer, TileLayer } from "react-leaflet";
import { HeatCircleMarkers } from "./HeatCircleMarkers";
import { CustomZoomControl } from "./CustomZoomControl";
import { LayerGeoJson } from "./LayerGeoJson";

/**
 * InteractiveMap Component
 *
 * Mapa Leaflet centrado en Colombia con el basemap CARTO Voyager. CARTO exige
 * una API key para sus tiles: se lee de `VITE_CARTO_API_KEY` (ver `.env`) y se
 * añade como el query param `?key=` (formato oficial:
 * https://carto.com/basemaps/apikey/). Incluye un control de zoom propio.
 */

const CARTO_API_KEY = (
  import.meta.env as Record<string, string | undefined>
).VITE_CARTO_API_KEY;

const CARTO_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" +
  (CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : "");

// Máximo alejamiento permitido: vista regional de Colombia (Panamá–Venezuela).
const MIN_ZOOM = 7;

export function InteractiveMap() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <MapContainer
        center={[4.5, -74.0]}
        zoom={MIN_ZOOM}
        minZoom={MIN_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false} // Desactivamos el control por defecto para usar el personalizado
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={CARTO_TILE_URL}
          subdomains="abcd"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Controles y Marcadores */}
        <CustomZoomControl />
        <HeatCircleMarkers />
        <LayerGeoJson />

      </MapContainer>
    </div>
  );
}
