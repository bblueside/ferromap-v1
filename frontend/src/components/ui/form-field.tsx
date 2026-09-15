import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  /** Debe coincidir con el `id` del control hijo (para `htmlFor` y el error). */
  id: string
  label: ReactNode
  /** Mensaje de error; si viene, se renderiza con `id="{id}-error"` y `role="alert"`. */
  error?: string
  /** Contenido alineado a la derecha del label (ej. enlace "¿Olvidaste...?"). */
  labelAside?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * Envoltura estándar de campo de formulario: label (+ slot lateral) + control +
 * mensaje de error. Centraliza espaciado y estilos de label/error.
 */
export function FormField({
  id,
  label,
  error,
  labelAside,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-ferromap-navy text-[13px] font-semibold tracking-wide"
        >
          {label}
        </Label>
        {labelAside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}
