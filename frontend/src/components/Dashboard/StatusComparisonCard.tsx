import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { POS_STATUSES, POS_STATUS_META, toneClass, type PosStatus } from "@/constants"
import type { StatusComparison } from "@/services/pos/posService"

/** Departamentos visibles en el desglose; el resto se omite para no alargar la tarjeta. */
const TOP_DEPARTAMENTOS = 8

const DEPARTAMENTO_KEY: Record<PosStatus, "activo" | "validar" | "inactivo"> = {
    ACTIVO: "activo",
    VALIDAR: "validar",
    INACTIVO: "inactivo",
}

interface StatusComparisonCardProps {
    data: StatusComparison
    title: string
    description: string
}

export function StatusComparisonCard({ data, title, description }: StatusComparisonCardProps) {
    const departamentos = data.byDepartamento.slice(0, TOP_DEPARTAMENTOS)
    // Todas las barras comparten escala: se compara el volumen entre departamentos.
    const maxTotal = Math.max(1, ...departamentos.map((d) => d.total))

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* ── Totales por estado ── */} 
                <div className="grid grid-cols-3 gap-3">
                    {data.byStatus.map(({ status, total, porcentaje }) => {
                        const { label, description, tone } = POS_STATUS_META[status]
                        return (
                            <div
                                key={status}
                                className={cn("flex flex-col gap-1 rounded-xl border px-4 py-3", toneClass(tone, "surface"))}
                                title={description}
                            >
                                <span className="text-xs font-medium">{label}</span>
                                <span className={cn("text-2xl font-semibold tabular-nums", toneClass(tone, "value"))}>
                                    {total.toLocaleString()}
                                </span>
                                <span className="text-xs tabular-nums">{porcentaje}%</span>
                            </div>
                        )
                    })}
                </div>

                {/* ── Barra 100% del total ── */}
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    {data.byStatus.map(({ status, porcentaje }) => (
                        <div
                            key={status}
                            className={toneClass(POS_STATUS_META[status].tone, "bar")}
                            style={{ width: `${porcentaje}%` }}
                            title={`${POS_STATUS_META[status].label}: ${porcentaje}%`}
                        />
                    ))}
                </div>

                {/* ── Desglose por departamento ── */}
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        Por departamento (top {departamentos.length})
                    </span>
                    {departamentos.map((d) => (
                        <div key={d.departamento} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
                            <span className="truncate" title={d.departamento}>{d.departamento}</span>
                            <div className="flex h-2.5 overflow-hidden rounded-full">
                                {POS_STATUSES.map((status) => {
                                    const count = d[DEPARTAMENTO_KEY[status]]
                                    return (
                                        <div
                                            key={status}
                                            className={toneClass(POS_STATUS_META[status].tone, "bar")}
                                            style={{ width: `${(count / maxTotal) * 100}%` }}
                                            title={`${POS_STATUS_META[status].label}: ${count}`}
                                        />
                                    )
                                })}
                            </div>
                            <span className="text-right tabular-nums text-muted-foreground">{d.total}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
