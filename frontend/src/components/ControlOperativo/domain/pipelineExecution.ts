/**
 * Reglas de ejecución del pipeline externo (:5000): traducción de estados a la
 * UI y polling de una ejecución. Sin React ni estado; `usePipelineRunner` las
 * orquesta.
 */

import { PIPELINE_STATUS, PIPELINE_TERMINAL_STATUSES, type AgentStatus } from "@/constants";
import {
  getPipelineStatus,
  type AgentCode,
  type PipelineStage,
  type PipelineStatusResponse,
  type RunResponse,
} from "@/services/pipelineService";
import type { CodedProgress } from "./agentRoster";

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 2000;

/** Estado del pipeline → estado del badge del agente. */
function toAgentStatus(status?: string): AgentStatus {
  switch (status) {
    case PIPELINE_STATUS.queued:
    case PIPELINE_STATUS.running:
      return "Running";
    case PIPELINE_STATUS.failed:
      return "Failed";
    default:
      return "Idle";
  }
}

function stageTask(stage: PipelineStage): string {
  if (stage.status === PIPELINE_STATUS.completed) return "Completed";
  if (stage.status === PIPELINE_STATUS.completedWithWarnings) return "Completed with warnings";
  return stage.message || stage.status || "Processing...";
}

function toStageProgress(response: PipelineStatusResponse): CodedProgress[] {
  return (response.stages ?? []).flatMap((stage) =>
    stage.agent_code
      ? [{ code: stage.agent_code as AgentCode, status: toAgentStatus(stage.status), task: stageTask(stage) }]
      : []
  );
}

function isTerminal(response: PipelineStatusResponse): boolean {
  return PIPELINE_TERMINAL_STATUSES.has(response.status ?? "");
}

/** Extrae `execution_id` o falla con `missingIdMessage`. */
export function requireExecutionId(result: RunResponse, missingIdMessage: string): string {
  if (!result.execution_id) throw new Error(missingIdMessage);
  return result.execution_id;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

export type PollOutcome =
  | { kind: "finished"; status: string }
  | { kind: "timeout" }
  | { kind: "aborted" };

/**
 * Consulta el estado de `executionId` hasta que termine, se agoten los intentos
 * o se aborte `signal`. `onStages` recibe el progreso de cada consulta.
 */
export async function pollPipelineExecution(
  executionId: string,
  onStages: (stages: CodedProgress[]) => void,
  signal: AbortSignal
): Promise<PollOutcome> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    if (signal.aborted) return { kind: "aborted" };

    const response = await getPipelineStatus(executionId);
    if (signal.aborted) return { kind: "aborted" };

    onStages(toStageProgress(response));
    if (isTerminal(response)) return { kind: "finished", status: response.status ?? "" };

    await wait(POLL_INTERVAL_MS, signal);
  }
  return signal.aborted ? { kind: "aborted" } : { kind: "timeout" };
}
