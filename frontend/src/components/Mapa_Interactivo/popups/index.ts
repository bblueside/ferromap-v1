/**
 * Contenido React que se inyecta dentro de popups de Leaflet (vía
 * `useReactLeafletPopups` / `createPortal`). Son componentes de presentación
 * puros: reciben datos ya resueltos y no tocan el mapa. `PosDataModal` es
 * detalle interno de `PosPopup`.
 */
export { PosPopup } from "./PosPopup";
export { HeatCirclePopup } from "./HeatCirclePopup";
