import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";
import type { Pos } from "@/services/pos/posService";
import { BadgeCard } from "@/components/ui/BadgeCard";
import { POS_STATUS_META, PRIORITY_META, coverageToPercent, metaFor, scoreTone, toneClass } from "@/constants";
import { Button } from "@/components/ui/button";
import { PosDataModal } from "./PosDataModal";
import { useState } from "react";

interface PosPopupProps {
    ferreteria: Pos;
    // priority eliminado: ahora se lee directamente de ferreteria.priority
}

const NEUTRAL_BADGE = toneClass("neutral", "badge");

export function PosPopup({ ferreteria }: PosPopupProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Valores fuera de catálogo caen en un badge neutro con el texto crudo.
    const status = metaFor(POS_STATUS_META, ferreteria.status, null);
    const priority = metaFor(PRIORITY_META, ferreteria.priority, null);
    const dotColor = priority?.hex ?? PRIORITY_META.Baja.hex;
    const coverage = coverageToPercent(ferreteria.coverage);

    const statusBadge = {
        label: status?.label ?? ferreteria.status,
        className: status ? toneClass(status.tone, "badge") : NEUTRAL_BADGE,
    };
    const priorityBadge = {
        label: priority?.badgeLabel ?? ferreteria.priority,
        className: priority ? toneClass(priority.tone, "badge") : NEUTRAL_BADGE,
    };
    const confidenceBadge = toneClass(scoreTone(ferreteria.confidence, "confidence"), "badge");
    const coverageBadge = coverage == null ? NEUTRAL_BADGE : toneClass(scoreTone(coverage, "coverage"), "badge");

    return (
        <Card className="border-0 shadow-none rounded-none m-0 p-0 outline-none ring-0 min-w-[240px]">
            <CardHeader className="gap-2 pb-3 px-1 pt-1">

                {/* Nombre + municipio */}
                <div className="flex items-start gap-2">
                    <span
                        className="mt-[3px] shrink-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: dotColor, boxShadow: `0 0 0 1.5px ${dotColor}40` }}
                    />
                    <div>
                        <CardTitle className="text-[0.88rem] font-bold text-slate-900 leading-tight">
                            {ferreteria.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-[0.70rem] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {ferreteria.municipio} {" - "}
                            {ferreteria.address}
                        </CardDescription>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <TooltipProvider>

                        {/* Status */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={statusBadge.label}
                                    className={statusBadge.className}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Estado operativo: Indica si el negocio está activo o si requiere validación antes de gestionarlo.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Priority */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={priorityBadge.label}
                                    className={priorityBadge.className}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Prioridad comercial de esta ferretería.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Size */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={"Tamaño: " + ferreteria.size}
                                    className={toneClass("info", "badge")}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Tamaño: Indica el tamaño estimado de la ferretería.</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={"Tipo: " + ferreteria.categoria}
                                    className={NEUTRAL_BADGE}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Tipo: Indica si es ferretería, depósito o distribuidor.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Confidence */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={"Confianza: " + ferreteria.confidence}
                                    className={confidenceBadge}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Confianza: Nivel de certeza del modelo sobre la información de esta ferretería.</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Coverage */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <BadgeCard
                                    label={"Cobertura: " + (coverage == null ? "—" : `${coverage}%`)}
                                    className={coverageBadge}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Cobertura: Nivel de cobertura de la zona a la que pertenece esta ferretería.</p>
                            </TooltipContent>
                        </Tooltip>

                    </TooltipProvider>
                </div>



                <Button
                    variant="outline"
                    className="w-full rounded-lg bg-transparent text-sm font-medium text-slate-600"
                    onClick={() => setIsModalOpen(true)}
                >
                    Ver información
                </Button>
            </CardHeader>

            {/* Modal */}
            {isModalOpen && (
                <PosDataModal
                    ferreteria={ferreteria}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </Card>
    );
}