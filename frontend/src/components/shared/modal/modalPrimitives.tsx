import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Primitivas de modal. Sus estilos son las clases `ui-*` de `App.css` (capa components). */

type ModalButtonProps = ComponentProps<"button"> & { variant?: "primary" | "brand" | "outline" };

/** Botón de acción de los modales. */
export function ModalButton({ variant = "primary", className, type = "button", ...props }: ModalButtonProps) {
  return <button type={type} className={cn("ui-modal-btn", `ui-modal-btn-${variant}`, className)} {...props} />;
}

export function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("ui-field-label", className)}>{children}</span>;
}

/** Lista clave/valor con separadores (resúmenes al pie de los modales). */
export function SummaryList({ children }: { children: ReactNode }) {
  return <div className="ui-summary">{children}</div>;
}

export function SummaryRow({ label, children, valueClassName }: { label: string; children: ReactNode; valueClassName?: string }) {
  return (
    <div className="ui-summary-row">
      <span className="ui-summary-label">{label}</span>
      <span className={cn("ui-summary-value", valueClassName)}>{children}</span>
    </div>
  );
}

export function ModalError({ children }: { children: ReactNode }) {
  return <div className="ui-modal-error">{children}</div>;
}

/**
 * Opción seleccionable dentro de un grupo (frecuencia, día, formato). El
 * estado seleccionado lo pinta CSS a partir de `aria-pressed`.
 */
export function ChoiceButton({
  selected,
  appearance = "pill",
  className,
  ...props
}: ComponentProps<"button"> & { selected: boolean; appearance?: "pill" | "segment" | "card" }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn("ui-choice", `ui-choice-${appearance}`, className)}
      {...props}
    />
  );
}
