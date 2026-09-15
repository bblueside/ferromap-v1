/**
 * components/ApiStateWrapper.tsx
 */

import { Loader2 } from "lucide-react"

interface ApiStateLoadingProps {
    children?: React.ReactNode
}

interface ApiStateErrorProps {
    children?: React.ReactNode
}

export function ApiStateLoading({ children }: ApiStateLoadingProps) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">{children ?? "Cargando datos..."}</p>
            </div>
        </div>
    )
}

export function ApiStateError({ children }: ApiStateErrorProps) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <p className="text-sm font-medium">No se pudieron cargar los datos.</p>
                <p className="text-xs text-slate-400">{children}</p>
            </div>
        </div>
    )
}