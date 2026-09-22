/**
 * services/http.ts
 *
 * Utilidades compartidas por todos los servicios: un `fetch` que parsea JSON
 * con errores legibles, y un hook genérico que ejecuta un `fetcher` al montar
 * y expone `{ data, loading, error, refetch }`.
 *
 * El `fetcher` debe ser estable (definido a nivel de módulo o memoizado).
 */

import { useCallback, useEffect, useMemo, useState } from "react";

export type FetchState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

// Se dispara cuando CUALQUIER petición hecha con `fetchJson` responde 401
// (típicamente: el JWT de 1 h venció a mitad de sesión). Lo registra
// `AuthProvider` para pasar el estado global a "unauthenticated"; así ningún
// componente tiene que manejar el 401 por su cuenta.
let onUnauthorized: (() => void) | null = null;

/** Registra (o limpia, pasando `null`) el handler global de 401. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
    onUnauthorized = handler;
}

/** Respuesta HTTP no exitosa; conserva el status para decidir cómo reaccionar. */
export class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}

// Status que devuelve un proxy (Vite en dev, el reverse proxy en prod) cuando
// el backend detrás no responde.
const GATEWAY_STATUSES = new Set([502, 503, 504]);

/**
 * El backend no está en ejecución o no es accesible: `fetch` rechaza con
 * `TypeError` cuando no hay respuesta, y un proxy intermedio responde 502-504.
 */
export function isBackendUnavailable(error: unknown): boolean {
    return (
        error instanceof TypeError ||
        (error instanceof HttpError && GATEWAY_STATUSES.has(error.status))
    );
}

/** GET/POST con parseo de JSON y mensajes de error uniformes. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);

    // Interceptar el 401 ANTES del check genérico de `!res.ok`: es el único
    // status que dispara una reacción global (volver al login), no solo un
    // error a mostrar en la pantalla que hizo la petición.
    if (res.status === 401) {
        onUnauthorized?.();
        throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
    }

    if (!res.ok) {
        throw new HttpError(res.status, `Error ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(
            `La respuesta no es JSON válido. Primeros 80 chars: ${text.slice(0, 80)}`
        );
    }
}

/** Ejecuta `fetcher` al montar (y en cada `refetch`). */
export function useApiResource<T>(fetcher: () => Promise<T>): FetchState<T> {
    const [state, setState] = useState<Omit<FetchState<T>, "refetch">>({
        data: null,
        loading: true,
        error: null,
    });
    const [trigger, setTrigger] = useState(0);
    const refetch = useCallback(() => setTrigger((t) => t + 1), []);

    useEffect(() => {
        let cancelled = false;
        // Marca "cargando" al (re)disparar la petición; el resultado llega abajo.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({ ...prev, loading: true, error: null }));

        fetcher()
            .then((data) => {
                if (!cancelled) setState({ data, loading: false, error: null });
            })
            .catch((err: unknown) => {
                if (!cancelled)
                    setState({
                        data: null,
                        loading: false,
                        error: err instanceof Error ? err.message : "Error desconocido",
                    });
            });

        return () => {
            cancelled = true;
        };
        // `fetcher` se asume estable — ver el docblock del archivo.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
}
