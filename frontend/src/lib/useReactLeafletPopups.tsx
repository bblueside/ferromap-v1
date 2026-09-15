/**
 * lib/useReactLeafletPopups.tsx
 *
 * Une popups de Leaflet a componentes React vía `createPortal`. Reemplaza el
 * patrón "crear <div> + bindPopup + setState en popupopen/popupclose" que
 * estaba repetido tres veces en HeatCircleMarkers (zona / ferretería / Ferromap).
 *
 *   const { bind, portals, reset } = useReactLeafletPopups();
 *   bind(circle, { minWidth: 300, render: () => <MiPopup ... /> });
 *   return <>{portals}</>;
 */

import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";

interface PopupEntry {
    id: number;
    container: HTMLElement;
    node: ReactNode;
}

export interface BindPopupOptions {
    minWidth?: number;
    maxWidth?: number;
    /** Se invoca al abrir el popup; su resultado se monta en el portal. */
    render: () => ReactNode;
}

export type BindPopup = (
    circle: L.CircleMarker,
    options: BindPopupOptions
) => void;

let nextId = 0;

export function useReactLeafletPopups(): {
    bind: BindPopup;
    portals: ReactNode[];
    reset: () => void;
} {
    const [entries, setEntries] = useState<PopupEntry[]>([]);

    const bind = useCallback<BindPopup>(
        (circle, { minWidth = 240, maxWidth = 320, render }) => {
            const container = document.createElement("div");
            circle.bindPopup(L.popup({ minWidth, maxWidth }).setContent(container));

            circle.on("popupopen", () => {
                setEntries((prev) =>
                    prev.some((e) => e.container === container)
                        ? prev
                        : [...prev, { id: nextId++, container, node: render() }]
                );
            });
            circle.on("popupclose", () => {
                setEntries((prev) => prev.filter((e) => e.container !== container));
            });
        },
        []
    );

    const reset = useCallback(() => setEntries([]), []);

    const portals = entries.map((e) => createPortal(e.node, e.container, String(e.id)));

    return { bind, portals, reset };
}
