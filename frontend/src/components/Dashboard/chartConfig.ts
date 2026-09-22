import type { ChartConfig } from "@/components/ui/chart"
import { FERROMAP_PALETTE, COMPLETENESS_META } from "@/constants"


// ─── G-01 ·  Resumen general ──────────────────────────────────────────────────────────────────────────────


// ─── G-02 · Top zonas con mayor potencial ──────────────────────────────────────────────────

export const barChartTitle = "Top zonas con mayor potencial"
export const barChartDescription = "Ciudades con mayor potencial por Zona"


// ─── G-03 ·  Brecha Ferromap por departamento ──────────────────────────────────────────────────

export const barMultipleChartTitle = "Brecha Ferromap por departamento"
export const barMultipleChartDescription = "Ferreterías Ferromap vs Total de Ferreterías"




// ─── G-04 ·  Registros por agente ──────────────────────────────────────────────────

export const pieChartTitleAgent = "Registros por agente"
export const pieChartDescriptionAgent = "Cantidad de registros por agente"


export const pieChartConfig = {
    quantity: {
        label: "Cantidad",
    },
    "RAG Agent": {
        label: "RAG Agent",
        color: FERROMAP_PALETTE.blueSky,
    },
    "Web Scraper Agent": {
        label: "Web Scraper Agent",
        color: FERROMAP_PALETTE.blueVibrant,
    },
    "API Agent": {
        label: "API Agent",
        color: FERROMAP_PALETTE.blueMedium,
    },
} satisfies ChartConfig



// ─── G-05  · Distribución por Completitud ────────────────────────────────────────────
export const donutChartTitleCompleteness = "Distribución por Completitud"
export const donutChartDescriptionCompleteness = "Distribución por completitud de ferreterías"

export const CoverageChartConfig = {
    quantity: {
        label: "Ferreterías",
    },
    [COMPLETENESS_META.listos.label]: {
        label: "Listos (40%)",
        color: COMPLETENESS_META.listos.color,
    },
    [COMPLETENESS_META.contactables.label]: {
        label: "Contactables (30%)",
        color: COMPLETENESS_META.contactables.color,
    },
    [COMPLETENESS_META.incompletos.label]: {
        label: "Incompletos (20%)",
        color: COMPLETENESS_META.incompletos.color,
    },
    [COMPLETENESS_META.sin_contacto.label]: {
        label: "Sin contacto (10%)",
        color: COMPLETENESS_META.sin_contacto.color,
    },
} satisfies ChartConfig

// ─── G-07 · Ranking de zonas por prioridad ─────────────────────────────────────────
export const priorityRankingTitle = "Ranking de zonas por prioridad"
export const priorityRankingDescription = "Top 10 zonas ordenadas por prioridad y potencial"

// ─── G-08 · Estado operativo de ferreterías ────────────────────────────────────────
export const statusComparisonTitle = "Estado operativo de ferreterías"
export const statusComparisonDescription = "Ferreterías activas, por validar e inactivas"

// ─── G-06 · Evolución de registros por corrida del pipeline ──────────────────────────────────────────────────

export const lineChartTitle = "Evolución de registros"
export const lineChartDescription = "Aumento de cantidad de registros por fecha"

export const lineChartData = [
    { date: "20/05", quantity: 186 },
    { date: "21/05", quantity: 305 },
    { date: "22/05", quantity: 237 },
    { date: "23/05", quantity: 73 },
    { date: "24/05", quantity: 209 },
    { date: "25/05", quantity: 214 },
]

export const lineChartConfig = {
    quantity: {
        label: "Quantity",
        color: FERROMAP_PALETTE.blueVibrant,
    },
} satisfies ChartConfig
