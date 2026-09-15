import { createPortal } from "react-dom";
import { X, MapPin, Phone, Store, Building2, Tag, Link, Hash, ShieldCheck } from "lucide-react";
import type { Pos } from "@/services/pos/posService";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PosModalProps {
    ferreteria: Pos;
    onClose: () => void;
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | number | string[];
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

export function PosDataModal({ ferreteria, onClose }: PosModalProps) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div
                className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* ── Header ── */}
                <div className="relative flex flex-col gap-1 bg-muted/50 px-5 pt-5 pb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3 h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X size={15} />
                    </Button>

                    <div className="flex items-center gap-3 pr-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm">
                            <Store size={18} className="text-foreground" />
                        </div>
                        <div>
                            <p
                                id="modal-title"
                                className="text-base font-semibold leading-tight text-foreground"
                            >
                                {ferreteria.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {ferreteria.categoria}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* ── Ubicación ── */}
                <div className="flex flex-col gap-3 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ubicación</p>
                    <InfoRow
                        icon={<MapPin size={15} />}
                        label="Dirección"
                        value={ferreteria.address}
                    />
                    <InfoRow
                        icon={<Building2 size={15} />}
                        label="Municipio / Departamento"
                        value={`${ferreteria.municipio} — ${ferreteria.departamento}`}
                    />
                </div>

                <Separator />

                {/* ── Contacto ── */}
                <div className="flex flex-col gap-3 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contacto</p>
                    <InfoRow
                        icon={<Phone size={15} />}
                        label="Teléfono"
                        value={ferreteria.phone ?? "No disponible"}
                    />
                    <InfoRow
                        icon={<Hash size={15} />}
                        label="NIT"
                        value={ferreteria.NIT ?? "No disponible"}
                    />
                </div>

                <Separator />

                {/* ── Datos del censo ── */}
                <div className="flex flex-col gap-3 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datos del censo</p>
                    <InfoRow
                        icon={<Tag size={15} />}
                        label="Fuentes"
                        value={ferreteria.source_agents.join(", ")}
                    />
                    <InfoRow
                        icon={<ShieldCheck size={15} />}
                        label="Calidad del dato"
                        value={ferreteria.quality}
                    />
                    {ferreteria.source_url && (
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Link size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground">URL fuente</p>
                                <a
                                    href={ferreteria.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block truncate text-sm font-medium ui-link"
                                >
                                    {ferreteria.source_url}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

            </div>
        </div>,
        document.body
    );
}