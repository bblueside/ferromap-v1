import { Upload } from "lucide-react";
import { useDisclosure } from "../hooks/useDisclosure";
import { useNormalizationPreview } from "../hooks/useNormalizationPreview";
import { PreviewDataMatches } from "../modals/preview/PreviewDataMatches";
import { FileUploadModal } from "../modals/upload/FileUploadModal";
import { AgentCardLayout } from "./AgentCardLayout";
import { AgentActionButton, RunAgentButton } from "./AgentControls";
import type { AgentCardProps } from "./types";

/** Tarjeta del agente de ingesta: subir → preview de datos normalizados → confirmar carga. */
export function InputDataAgentCard({ agent, onRun }: AgentCardProps) {
  const upload = useDisclosure();
  const { preview, loadPreview, confirmPreview, closePreview } = useNormalizationPreview(agent.id);

  return (
    <>
      <AgentCardLayout
        agent={agent}
        footerAlign="end"
        footer={
          <div className="flex items-center gap-3">
            {agent.hasUpload && <AgentActionButton icon={Upload} label="Subir" onClick={upload.open} />}
            <RunAgentButton onClick={() => onRun(agent)} />
          </div>
        }
      />

      {upload.isOpen && <FileUploadModal agent={agent} onClose={upload.close} onUploaded={loadPreview} />}
      {preview && <PreviewDataMatches preview={preview} onConfirm={confirmPreview} onClose={closePreview} />}
    </>
  );
}
