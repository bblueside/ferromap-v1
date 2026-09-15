import L from "leaflet";
import { MAP_COLORS } from "@/constants";

// Paths SVG extraídos directamente de Lucide (stroke-based, viewBox 0 0 24 24)
const FACTORY_PATH = `
  <polyline points="2 20 2 11 7 11 7 20"/>
  <polyline points="22 20 22 7 13 7 13 20"/>
  <path d="M7 20H13V12H7z"/>
  <path d="M22 7H17V4l-5 3"/>
  <line x1="2" y1="20" x2="22" y2="20"/>
`;

const WAREHOUSE_PATH = `
  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
  <path d="M6 18h12"/>
  <path d="M6 14h12"/>
  <rect x="8" y="14" width="8" height="6"/>
`;

// ─── iconPlanta — círculo naranja + Factory ───────────────────────────────────

export const iconPlanta = L.divIcon({
  className: "",
  html: `
    <div style="
        width:32px; height:32px;
        border-radius:50%;
        background:${MAP_COLORS.planta};
        border:2px solid ${MAP_COLORS.iconStroke};
        box-shadow:0 2px 6px ${MAP_COLORS.iconShadow};
        display:flex; align-items:center; justify-content:center;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none"
             stroke="${MAP_COLORS.iconStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${FACTORY_PATH}
        </svg>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

// ─── iconDist — rectángulo verde + Warehouse ──────────────────────────────────

export const iconDist = L.divIcon({
  className: "",
  html: `
    <div style="
        width:38px; height:28px;
        border-radius:6px;
        background:${MAP_COLORS.distribucion};
        border:2px solid ${MAP_COLORS.iconStroke};
        box-shadow:0 2px 6px ${MAP_COLORS.iconShadow};
        display:flex; align-items:center; justify-content:center;
    ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
             viewBox="0 0 24 24" fill="none"
             stroke="${MAP_COLORS.iconStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${WAREHOUSE_PATH}
        </svg>
    </div>`,
  iconSize: [38, 28],
  iconAnchor: [19, 14],
  popupAnchor: [0, -16],
});