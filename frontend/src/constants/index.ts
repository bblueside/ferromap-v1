/**
 * constants/index.ts — Constantes globales de UI: colores y estados.
 *
 * Única fuente de verdad de datos visuales. Ningún componente debe declarar hex
 * ni mapas de estado → color por su cuenta.
 *
 *   1. COLORES  hex para APIs que no aceptan clases (Leaflet, Recharts, HTML inline).
 *   2. TONOS    nombres tipados de las clases `ui-tone-*`.
 *   3. ESTADOS  valores canónicos (deben coincidir con backend/JSON) + etiqueta + tono.
 *
 * Los ESTILOS (clases `ui-*`: página, botones, modales, tablas, tonos) viven en
 * `src/App.css`.
 *
 * Reglas:
 *   - Los colores de marca también existen como tokens CSS en `index.css`
 *     (`bg-ferromap-lime`, `var(--color-ferromap-lime)`). Si cambias un hex de
 *     `BRAND_COLORS` o `MAP_COLORS`, actualízalo también allí.
 */

// ═══ 1. COLORES ══════════════════════════════════════════════════════════════

/** Paleta corporativa Ferromap (Pantone). */
export const FERROMAP_PALETTE = {
  yellowPale: "#F0E991", // PANTONE 601C
  yellowBright: "#E3E935", // PANTONE 387C
  yellowOlive: "#ABAD23", // PANTONE 7745C
  greenSage: "#C4D6A4", // PANTONE 580C
  greenVibrant: "#6CC24A", // PANTONE 360C
  greenDark: "#67823A", // PANTONE 575C
  tealLight: "#A7E6D7", // PANTONE 331C
  tealMint: "#00C389", // PANTONE 3395C
  tealDeep: "#279989", // PANTONE 7473C
  blueSky: "#9BCBEB", // PANTONE 291C
  blueVibrant: "#00A3E0", // PANTONE 299C
  blueMedium: "#426DA9", // PANTONE 7683C
} as const;

/** Colores de marca de la interfaz. Espejo: `--color-ferromap-*` en `index.css`. */
export const BRAND_COLORS = {
  lime: "#c4d600",
  limeHover: "#b0c000",
  limeDark: "#8a9600",
  ink: "#132133",
  navy: "#1b2a5c",
  white: "#ffffff",
} as const;

/** Capas del mapa (Leaflet). Espejo: `--color-map-*` en `index.css`. */
export const MAP_COLORS = {
  markerStroke: BRAND_COLORS.white,
  planta: "#f97316",
  distribucion: "#22c55e",
  ruta: "#f97316",
  iconStroke: BRAND_COLORS.white,
  iconShadow: "rgba(0,0,0,.3)",
} as const;

/** Orden de colores para series sin color propio (donas, pasteles). */
export const CHART_SERIES_COLORS: readonly string[] = [
  FERROMAP_PALETTE.greenVibrant,
  FERROMAP_PALETTE.blueVibrant,
  FERROMAP_PALETTE.yellowBright,
  FERROMAP_PALETTE.blueMedium,
  FERROMAP_PALETTE.greenDark,
  FERROMAP_PALETTE.yellowOlive,
  FERROMAP_PALETTE.blueSky,
  FERROMAP_PALETTE.tealDeep,
];

// ═══ 2. TONOS ════════════════════════════════════════════════════════════════

/**
 * Familia semántica de color. Las clases viven en `App.css` como
 * `ui-tone-{tone}-{slot}`; aquí solo se nombran para que el tipado las proteja.
 */
export type Tone = "success" | "warning" | "danger" | "info" | "progress" | "neutral" | "brand";

/** badge: fondo+borde+texto · dot: punto · bar: barra · text: texto · surface: tarjeta suave · value: cifra fuerte. */
export type ToneSlot = "badge" | "dot" | "bar" | "text" | "surface" | "value";

/** Clase CSS de un tono (`App.css`, capa `semantic`). */
export function toneClass(tone: Tone, slot: ToneSlot): string {
  return `ui-tone-${tone}-${slot}`;
}

/** Entrada de `key` en un catálogo; `fallback` si el valor no es canónico. */
export function metaFor<K extends string, V>(catalog: Record<K, V>, key: string | null | undefined, fallback: V): V {
  return key != null && key in catalog ? catalog[key as K] : fallback;
}

// ═══ 3. ESTADOS ══════════════════════════════════════════════════════════════

// ─── Ferretería (POS): estado operativo ─────────────────────────────────────

export const POS_STATUSES = ["ACTIVO", "VALIDAR", "INACTIVO"] as const;
export type PosStatus = (typeof POS_STATUSES)[number];

/** Estados que el censo publica hoy y que ofrece el filtro del mapa. */
export const MAP_POS_STATUSES: PosStatus[] = ["ACTIVO", "VALIDAR"];

export const POS_STATUS_META: Record<PosStatus, { label: string; description: string; tone: Tone }> = {
  ACTIVO: { label: "Activo", description: "Negocio en operación", tone: "success" },
  VALIDAR: { label: "Validar", description: "Requiere verificación", tone: "warning" },
  INACTIVO: { label: "Inactivo", description: "Negocio sin operación", tone: "danger" },
};

// ─── Ferretería (POS): categoría / tipo de negocio ──────────────────────────

/** Los valores DEBEN coincidir exactamente con `Pos.categoria` del censo. */
export type Categoria = "Ferreteria" | "Distribuidora" | "Deposito";

export interface CategoriaOption {
  value: Categoria;
  label: string;
}

export const CATEGORIAS: CategoriaOption[] = [
  { value: "Ferreteria", label: "Ferretería" },
  { value: "Distribuidora", label: "Distribuidora" },
  { value: "Deposito", label: "Depósito" },
];

/** Valores canónicos, en orden — para inicializar sets de filtro. */
export const CATEGORIA_VALUES: Categoria[] = CATEGORIAS.map((c) => c.value);

// ─── Prioridad comercial de zona / ferretería ───────────────────────────────

export const PRIORITIES = ["Alta", "Media", "Baja"] as const;
export type Priority = (typeof PRIORITIES)[number];

export function isPriority(value: string): value is Priority {
  return (PRIORITIES as readonly string[]).includes(value);
}

export interface PriorityMeta {
  /** Etiqueta de badge — "Prioridad Alta". */
  badgeLabel: string;
  /** Etiqueta del filtro del sidebar — "Alta prioridad". */
  filterLabel: string;
  description: string;
  tone: Tone;
  /** Color del círculo en el mapa (Leaflet CircleMarker) y de su punto en filtros. */
  hex: string;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  Alta: {
    badgeLabel: "Prioridad Alta",
    filterLabel: "Alta prioridad",
    description: "Zonas con mayor potencial",
    tone: "danger",
    hex: "#DC2626",
  },
  Media: {
    badgeLabel: "Prioridad Media",
    filterLabel: "Media prioridad",
    description: "Zonas con potencial moderado",
    tone: "warning",
    hex: "#EA580C",
  },
  Baja: {
    badgeLabel: "Prioridad Baja",
    filterLabel: "Baja prioridad",
    description: "Zonas en seguimiento",
    tone: "success",
    hex: "#6B7280",
  },
};

// ─── Calidad del dato ───────────────────────────────────────────────────────

export const QUALITY_LEVELS = ["Alta", "Media", "Baja"] as const;
export type QualityLevel = (typeof QUALITY_LEVELS)[number];

export const QUALITY_TONE: Record<QualityLevel, Tone> = {
  Alta: "success",
  Media: "info",
  Baja: "warning",
};

// ─── Puntajes 0–100 (cobertura, confianza) ──────────────────────────────────

export type ScoreMetric = "coverage" | "confidence";
export type ScoreLevel = "high" | "medium" | "low";

/** Umbrales inclusivos (≥) de cada nivel, en escala 0–100. */
export const SCORE_THRESHOLDS: Record<ScoreMetric, { high: number; medium: number }> = {
  coverage: { high: 70, medium: 50 },
  confidence: { high: 70, medium: 40 },
};

export const SCORE_LEVEL_TONE: Record<ScoreLevel, Tone> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

export function scoreLevel(value: number, metric: ScoreMetric): ScoreLevel {
  const { high, medium } = SCORE_THRESHOLDS[metric];
  if (value >= high) return "high";
  if (value >= medium) return "medium";
  return "low";
}

/** Tono de un puntaje 0–100 según los umbrales de `metric`. */
export function scoreTone(value: number, metric: ScoreMetric): Tone {
  return SCORE_LEVEL_TONE[scoreLevel(value, metric)];
}

/** La cobertura llega como fracción en texto ("0.8"); se expresa en 0–100. */
export function coverageToPercent(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

// ─── Completitud del dato (dashboard y reportes) ────────────────────────────

export const COMPLETENESS_LEVELS = ["listos", "contactables", "incompletos", "sin_contacto"] as const;
export type CompletenessLevel = (typeof COMPLETENESS_LEVELS)[number];

export const COMPLETENESS_META: Record<CompletenessLevel, { label: string; color: string }> = {
  listos: { label: "Listos", color: FERROMAP_PALETTE.greenVibrant },
  contactables: { label: "Contactables", color: FERROMAP_PALETTE.blueVibrant },
  incompletos: { label: "Incompletos", color: FERROMAP_PALETTE.tealDeep },
  sin_contacto: { label: "Sin contacto", color: FERROMAP_PALETTE.yellowBright },
};

// ─── Agentes: estado visible en la tarjeta ──────────────────────────────────

export const AGENT_STATUSES = ["Running", "Idle", "Failed"] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const AGENT_STATUS_TONE: Record<AgentStatus, Tone> = {
  Running: "success",
  Idle: "neutral",
  Failed: "danger",
};

// ─── Pipeline externo (:5000): estados crudos de la API ─────────────────────

export const PIPELINE_STATUS = {
  queued: "queued",
  running: "running",
  completed: "completed",
  completedWithWarnings: "completed_with_warnings",
  warning: "warning",
  failed: "failed",
  cancelled: "cancelled",
} as const;
export type PipelineStatus = (typeof PIPELINE_STATUS)[keyof typeof PIPELINE_STATUS];

/** Estados en los que una ejecución ya no avanza. */
export const PIPELINE_TERMINAL_STATUSES: ReadonlySet<string> = new Set<PipelineStatus>([
  PIPELINE_STATUS.completed,
  PIPELINE_STATUS.completedWithWarnings,
  PIPELINE_STATUS.failed,
  PIPELINE_STATUS.cancelled,
]);

// ─── Historial de ejecuciones (`agents_log`) normalizado ────────────────────

export const EXECUTION_STATUSES = ["queued", "running", "completed", "warning", "failed"] as const;
export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export const EXECUTION_STATUS_META: Record<ExecutionStatus, { label: string; tone: Tone }> = {
  queued: { label: "Queued", tone: "info" },
  running: { label: "Running", tone: "progress" },
  completed: { label: "Completed", tone: "success" },
  warning: { label: "Warning", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
};

// ─── Subida de archivos ─────────────────────────────────────────────────────

export const UPLOAD_ITEM_STATUSES = ["uploading", "done", "error"] as const;
export type UploadItemStatus = (typeof UPLOAD_ITEM_STATUSES)[number];

export const UPLOAD_ITEM_STATUS_META: Record<UploadItemStatus, { label: string; tone: Tone }> = {
  uploading: { label: "Subiendo…", tone: "info" },
  done: { label: "Listo", tone: "success" },
  error: { label: "Supera 10 MB", tone: "danger" },
};

// ─── Preview de normalización: registro nuevo vs. coincidencia ──────────────

export const MATCH_STATUSES = ["new", "match"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_STATUS_META: Record<MatchStatus, { label: string; legend: string; tone: Tone }> = {
  new: { label: "Nuevo", legend: "se creará en el mapa", tone: "success" },
  match: { label: "Match", legend: "actualizará un registro existente", tone: "warning" },
};
