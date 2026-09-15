import type { Agent } from "../domain/agent";

/** Contrato común de todas las variantes de tarjeta de agente. */
export interface AgentCardProps {
  agent: Agent;
  /** Registros aportados por el agente (`/api/control/getAllAgentRecords`). */
  records?: number | null;
  onToggleAuto: (agent: Agent) => void;
  onRun: (agent: Agent) => void;
  /** Archivos subidos al pipeline desde la tarjeta. */
  onUploadCompleted: (agent: Agent) => void;
}
