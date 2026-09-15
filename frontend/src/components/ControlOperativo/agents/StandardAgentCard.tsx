import { Cog, Download, Upload } from "lucide-react";
import { useDisclosure } from "../hooks/useDisclosure";
import { AgentConfigModal } from "../modals/AgentConfigModal";
import { ExportOutputModal } from "../modals/ExportOutputModal";
import { FileUploadModal } from "../modals/upload/FileUploadModal";
import { AgentCardLayout } from "./AgentCardLayout";
import { AgentActionButton, AgentAutoToggle, RunAgentButton } from "./AgentControls";
import type { AgentCardProps } from "./types";

/** Tarjeta con auto, admin, exportar y subir (la subida dispara `onUploadCompleted`). */
export function StandardAgentCard({ agent, records, onToggleAuto, onRun, onUploadCompleted }: AgentCardProps) {
  const upload = useDisclosure();
  const exportOutput = useDisclosure();
  const config = useDisclosure();

  const run = () => onRun(agent);
  // Sin `return`: el modal espera a `onUploaded`, y la ejecución posterior (con
  // polling de hasta ~40 s) no debe mantenerlo abierto.
  const handleUploaded = () => {
    onUploadCompleted(agent);
  };

  return (
    <>
      <AgentCardLayout
        agent={agent}
        records={records}
        footer={
          <>
            <AgentAutoToggle agent={agent} onToggle={onToggleAuto} />
            <div className="flex items-center gap-3">
              {agent.hasUpload && <AgentActionButton icon={Upload} label="Subir" onClick={upload.open} />}
              {agent.hasExport && <AgentActionButton icon={Download} label="Exportar" onClick={exportOutput.open} />}
              <AgentActionButton icon={Cog} label="Admin" onClick={config.open} />
              <RunAgentButton onClick={run} />
            </div>
          </>
        }
      />

      {upload.isOpen && (
        <FileUploadModal agent={agent} onClose={upload.close} onUploaded={handleUploaded} />
      )}
      {exportOutput.isOpen && <ExportOutputModal onClose={exportOutput.close} />}
      {config.isOpen && <AgentConfigModal agent={agent} onClose={config.close} onRunNow={run} />}
    </>
  );
}
