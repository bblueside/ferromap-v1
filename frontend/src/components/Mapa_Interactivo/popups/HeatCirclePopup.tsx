import { BadgeCard } from "@/components/ui/BadgeCard"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import type { zone } from "@/services/pos/posService"
import { PRIORITY_META, metaFor, toneClass } from "@/constants"
import { cn } from "@/lib/utils"

interface HeatCirclePopupProps {
    zone: zone
}




export function HeatCirclePopup({ zone }: HeatCirclePopupProps) {
    // Fallback defensivo por si el API envía una prioridad fuera del catálogo.
    const priority = metaFor(PRIORITY_META, zone.priority, PRIORITY_META.Baja)
    const infoBadge = cn(toneClass("info", "badge"), "cursor-pointer")
    return (
        <Card className="border-0 shadow-none rounded-none m-0 p-0 outline-none ring-0">
            <CardHeader className="gap-2 pb-3 px-1 pt-1">
                <div>
                    <CardTitle className="text-[0.9rem] font-bold text-slate-900 leading-tight">
                        {zone.name}
                    </CardTitle>

                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={priority.badgeLabel}
                                    className={toneClass(priority.tone, "badge")}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Prioridad Comercial: Identifica las zonas con mayor potencial de crecimiento. </p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={`Potencial Ferromap: ${zone.potential_score}`}
                                    className={infoBadge}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Potencial Ferromap: Identifica las zonas con mayor potencial de crecimiento. Puntaje asignado por el modelo de IA</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={`Ferreterias: ${zone.ferreterias_count}`}
                                    className={infoBadge}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ferreterias: Número de ferreterias en la zona</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <CardDescription className="text-[0.72rem] text-slate-400 mt-0.5">
                        {zone.analysis}
                    </CardDescription>
                </div>


            </CardHeader>
        </Card>
    )
}