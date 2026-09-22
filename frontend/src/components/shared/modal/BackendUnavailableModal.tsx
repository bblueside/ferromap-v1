import { ServerOff } from "lucide-react";
import { ModalShell } from "@/components/shared/modal/ModalShell";
import { ModalButton, ModalError } from "@/components/shared/modal/modalPrimitives";

/** Aviso de que el backend de agentes no responde. */
export function BackendUnavailableModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell
      title="Agentes no disponibles"
      subtitle="Los agentes no están en funcionamiento por el momento."
      icon={<ServerOff size={16} className="text-red-500" />}
      onClose={onClose}
    >
      <div className="space-y-5 px-5 py-5">
        <ModalError>
          El servidor backend no está en ejecución o no es accesible. Inténtelo en otro momento.
        </ModalError>
        <ModalButton className="w-full font-semibold" onClick={onClose}>
          Entendido
        </ModalButton>
      </div>
    </ModalShell>
  );
}
