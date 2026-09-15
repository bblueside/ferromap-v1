import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fondo difuminado que centra un panel; cierra con Escape. */
export function ModalOverlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Radix (Select) marca `defaultPrevented` cuando el Escape cierra su propio popover.
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return <div className="ui-modal-overlay">{children}</div>;
}

interface ModalShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon: ReactNode;
  /** Fondo del contenedor del icono. */
  iconVariant?: "default" | "brand";
  size?: "sm" | "lg";
  onClose: () => void;
  children: ReactNode;
  /** Contenido fijo bajo el cuerpo (acciones de modales grandes). */
  footer?: ReactNode;
}

/** Panel de modal con cabecera (icono, título, cerrar) común a toda la app. Estilos: `App.css`. */
export function ModalShell({
  title,
  subtitle,
  icon,
  iconVariant = "default",
  size = "sm",
  onClose,
  children,
  footer,
}: ModalShellProps) {
  const titleId = useId();

  return (
    <ModalOverlay onClose={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={`ui-modal-panel ui-modal-panel-${size}`}>
        <div className="ui-modal-header">
          <div className={cn("ui-modal-icon", iconVariant === "brand" && "ui-modal-icon-brand")}>{icon}</div>
          <div className="flex-1">
            <p id={titleId} className="ui-modal-title">{title}</p>
            {subtitle && <p className="ui-modal-subtitle">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="ui-modal-close">
            <X size={16} />
          </button>
        </div>

        {children}
        {footer}
      </div>
    </ModalOverlay>
  );
}
