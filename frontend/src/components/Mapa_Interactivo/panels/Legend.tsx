
import { iconPlanta, iconDist } from "../map/facilityIcons"
import L from "leaflet"
import { Route } from "lucide-react"

// ─── Helper ───────────────────────────────────────────────────────────────────
// Extrae el HTML interno de un L.DivIcon para renderizarlo en React

function DivIconPreview({ icon }: { icon: L.DivIcon }) {
    const html = icon.options.html

    if (!html || typeof html !== "string") return null

    return (
        <span
            className="inline-flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Legend() {
    return (
        <div className="flex w-full max-w-sm flex-col gap-2 text-sm p-5">
            <dl className="flex items-center justify-between">
                <dt>Plantas cementeras</dt>
                <dd className="text-muted-foreground">
                    <DivIconPreview icon={iconPlanta} />
                </dd>
            </dl>

            <dl className="flex items-center justify-between">
                <dt>Centros de Distribución</dt>
                <dd className="text-muted-foreground">
                    <DivIconPreview icon={iconDist} />
                </dd>
            </dl>

            <dl className="flex items-center justify-between">
                <dt>Rutas Óptimas</dt>
                <dd className="text-muted-foreground"><Route /> </dd>
            </dl>
        </div>
    )
}
