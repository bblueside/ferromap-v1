import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import type { Agent } from "../../domain/agent";
import { getAgentCodeFromName } from "@/services/agentAdapter";
import { uploadFileToAPI } from "@/services/pipelineService";
import { isBackendUnavailable } from "@/services/http";
import { cn } from "@/lib/utils";
import { errorMessage } from "../../domain/errors";
import { useUploadQueue } from "../../hooks/useUploadQueue";
import { toneClass } from "@/constants";
import { BackendUnavailableModal } from "@/components/shared/modal/BackendUnavailableModal";
import { ModalShell } from "@/components/shared/modal/ModalShell";
import { FieldLabel, ModalButton, ModalError, SummaryList, SummaryRow } from "@/components/shared/modal/modalPrimitives";
import { DropZone } from "./DropZone";
import { FileRow } from "./FileRow";

interface FileUploadModalProps {
  agent: Agent;
  onClose: () => void;
  /**
   * Se llama tras subir todos los archivos al pipeline y antes de cerrar. Si
   * rechaza, el error se muestra en el modal y este sigue abierto.
   */
  onUploaded: (files: File[]) => void | Promise<void>;
}

/** Selección de archivos + subida al pipeline para el agente dado. */
export function FileUploadModal({ agent, onClose, onUploaded }: FileUploadModalProps) {
  const { items, summary, addFiles, removeFile } = useUploadQueue();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const agentCode = getAgentCodeFromName(agent.name);
  const canSubmit = summary.allDone && !isSubmitting;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    if (!agentCode) {
      setSubmitError(`No existe mapeo API para ${agent.name}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const files = items.map((item) => item.file);
      await Promise.all(files.map((file) => uploadFileToAPI(file, agentCode)));
      await onUploaded(files);
      onClose();
    } catch (error) {
      if (isBackendUnavailable(error)) setBackendUnavailable(true);
      else setSubmitError(errorMessage(error, "Error al subir archivo a la API"));
      setIsSubmitting(false);
    }
  };

  // Reemplaza al modal de subida; al cerrarlo se cierra también la subida.
  if (backendUnavailable) return <BackendUnavailableModal onClose={onClose} />;

  return (
    <ModalShell
      title="Subir archivos"
      subtitle="Máximo 10 MB por archivo"
      icon={<Upload size={16} className="text-zinc-500" />}
      onClose={onClose}
    >
      <div className="space-y-4 px-5 py-5">
        <div>
          <FieldLabel className="mb-2 block">Archivos</FieldLabel>
          <DropZone acceptedFormats={agent.file} onFiles={addFiles} />
        </div>

        {items.length > 0 && (
          <>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-0.5">
              {items.map((item) => (
                <FileRow key={item.id} item={item} onRemove={removeFile} />
              ))}
            </div>

            <SummaryList>
              <SummaryRow label="Archivos seleccionados">{summary.total}</SummaryRow>
              <SummaryRow
                label="Completados"
                valueClassName={cn("font-semibold", toneClass(summary.allDone ? "success" : "info", "text"))}
              >
                {summary.doneCount} / {summary.total}
              </SummaryRow>
            </SummaryList>
          </>
        )}

        {submitError && <ModalError>{submitError}</ModalError>}

        <div className="flex gap-2.5 pt-1">
          <ModalButton className="flex-1 font-semibold" disabled={!canSubmit} onClick={handleConfirm}>
            <SubmitLabel isSubmitting={isSubmitting} allDone={summary.allDone} isPreparing={summary.isPreparing} />
          </ModalButton>
          <ModalButton variant="outline" className="px-4" onClick={onClose}>
            Cancelar
          </ModalButton>
        </div>
      </div>
    </ModalShell>
  );
}

function SubmitLabel({ isSubmitting, allDone, isPreparing }: { isSubmitting: boolean; allDone: boolean; isPreparing: boolean }) {
  if (isSubmitting) {
    return (
      <>
        <Loader2 size={15} className="animate-spin" />
        Subiendo a API...
      </>
    );
  }
  if (allDone) {
    return (
      <>
        <CheckCircle2 size={15} />
        Confirmar subida
      </>
    );
  }
  return (
    <>
      <Loader2 size={15} className={cn(isPreparing && "animate-spin")} />
      Subir archivos
    </>
  );
}
