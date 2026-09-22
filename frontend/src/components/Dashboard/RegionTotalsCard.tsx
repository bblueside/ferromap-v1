import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CHART_SERIES_COLORS } from "@/constants"
import type { RegionTotals } from "@/services/pos/posService"

interface RegionTotalsCardProps {
    data: RegionTotals
    title: string
    description: string
}

export function RegionTotalsCard({ data, title, description }: RegionTotalsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                {/* ── Total general ── */}
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tabular-nums">{data.total.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">ferreterías en total</span>
                </div>

                {/* ── Barra 100% por región ── */}
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    {data.byRegion.map(({ region, porcentaje }, idx) => (
                        <div
                            key={region}
                            style={{
                                width: `${porcentaje}%`,
                                backgroundColor: CHART_SERIES_COLORS[idx % CHART_SERIES_COLORS.length],
                            }}
                            title={`${region}: ${porcentaje}%`}
                        />
                    ))}
                </div>

                {/* ── Totales por región ── */}
                <div className="grid grid-cols-5 gap-3">
                    {data.byRegion.map(({ region, total, porcentaje }, idx) => (
                        <div key={region} className="flex flex-col gap-1 rounded-xl border px-4 py-3">
                            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: CHART_SERIES_COLORS[idx % CHART_SERIES_COLORS.length] }}
                                />
                                {region}
                            </span>
                            <span className="text-2xl font-semibold tabular-nums">{total.toLocaleString()}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">{porcentaje}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
