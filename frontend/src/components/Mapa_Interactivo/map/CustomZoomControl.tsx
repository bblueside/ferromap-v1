import { useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

/**
 * CustomZoomControl
 *
 * Renderiza los botones fuera del DOM de Leaflet via portal para evitar
 * que el mapa intercepte los eventos de click.
 * Se posiciona con CSS fijo en la esquina superior derecha.
 * Cada botón se deshabilita al alcanzar el límite de zoom del mapa.
 */
export function CustomZoomControl() {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

    const controls = (
        <div className="fixed top-24 right-6 z-[1000] flex flex-col gap-2 pointer-events-auto">
            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white shadow-lg border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
                disabled={zoom >= map.getMaxZoom()}
                title="Acercar"
            >
                <Plus className="h-5 w-5 text-slate-600" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white shadow-lg border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
                disabled={zoom <= map.getMinZoom()}
                title="Alejar"
            >
                <Minus className="h-5 w-5 text-slate-600" />
            </Button>
        </div>
    );

    // Portal: los botones viven en document.body, fuera del canvas de Leaflet
    return createPortal(controls, document.body);
}
