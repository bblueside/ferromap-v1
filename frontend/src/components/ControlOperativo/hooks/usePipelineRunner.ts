import { useCallback, useEffect, useRef, useState } from "react";
import type { Agent } from "../domain/agent";
import {
  runAllPipeline,
  runSingleAgent,
  type AgentCode,
  type RunResponse,
} from "@/services/pipelineService";
import { getAgentCodeFromName } from "@/services/agentAdapter";
import {
  byCode,
  byId,
  everyAgent,
  type AgentProgress,
  type CodedProgress,
} from "../domain/agentRoster";
import { isBackendUnavailable } from "@/services/http";
import { errorMessage } from "../domain/errors";
import { pollPipelineExecution, requireExecutionId } from "../domain/pipelineExecution";

/**
 * Agente que se ejecuta después de confirmar una subida de archivo desde una
 * tarjeta estándar. Se conserva el comportamiento previo (siempre A1).
 */
const UPLOAD_FOLLOW_UP_AGENT: AgentCode = "A1";

/** Qué lanzar, a qué agentes afecta y qué mensajes mostrar en cada paso. */
interface ExecutionPlan {
  targets: (agent: Agent) => boolean;
  request: () => Promise<RunResponse>;
  startMessage: string;
  startTask: string;
  missingIdMessage: string;
  fallbackError: string;
  /** Task de los agentes objetivo una vez hay `execution_id`. */
  startedTask?: (executionId: string) => string;
  /** Mensaje global una vez hay `execution_id`. */
  startedMessage?: (executionId: string) => string;
}

interface PipelineRunnerDeps {
  setProgress: (matches: (agent: Agent) => boolean, progress: AgentProgress) => void;
  applyStages: (stages: CodedProgress[]) => void;
  /** Se llama cuando una ejecución llega a un estado terminal. */
  onExecutionFinished: () => void;
}

/** Lanza ejecuciones en el pipeline externo y refleja su progreso en los agentes. */
export function usePipelineRunner({ setProgress, applyStages, onExecutionFinished }: PipelineRunnerDeps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  // El pipeline no respondió (servidor caído o inaccesible).
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const dismissBackendUnavailable = useCallback(() => setBackendUnavailable(false), []);

  // Cancela el polling en curso al desmontar la pestaña.
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
  }, []);

  const execute = useCallback(
    async (plan: ExecutionPlan) => {
      const signal = abortRef.current?.signal;
      if (!signal || signal.aborted) return;

      setIsExecuting(true);
      setLastMessage(plan.startMessage);
      setProgress(plan.targets, { status: "Running", task: plan.startTask });

      try {
        const id = requireExecutionId(await plan.request(), plan.missingIdMessage);
        if (signal.aborted) return;

        setExecutionId(id);
        if (plan.startedTask) setProgress(plan.targets, { status: "Running", task: plan.startedTask(id) });
        if (plan.startedMessage) setLastMessage(plan.startedMessage(id));

        const outcome = await pollPipelineExecution(id, applyStages, signal);
        if (outcome.kind === "aborted") return;

        setIsExecuting(false);
        if (outcome.kind === "finished") {
          setLastMessage(`Ejecución finalizada: ${outcome.status}`);
          onExecutionFinished();
        } else {
          setLastMessage("Ejecución iniciada. Usa Refresh para actualizar.");
        }
      } catch (error) {
        if (signal.aborted) return;
        const message = errorMessage(error, plan.fallbackError);
        setIsExecuting(false);
        setLastMessage(message);
        setProgress(plan.targets, { status: "Failed", task: message });
        if (isBackendUnavailable(error)) setBackendUnavailable(true);
      }
    },
    [setProgress, applyStages, onExecutionFinished]
  );

  const runAgent = useCallback(
    async (agent: Agent) => {
      const code = getAgentCodeFromName(agent.name);
      if (!code) {
        setProgress(byId(agent.id), { status: "Failed", task: `No existe mapeo API para ${agent.name}` });
        return;
      }
      await execute({
        targets: byId(agent.id),
        request: () => runSingleAgent(code),
        startMessage: `Ejecutando ${agent.name} (${code})...`,
        startTask: "Solicitando ejecución al backend...",
        startedTask: (id) => `Ejecución iniciada: ${id}`,
        missingIdMessage: "La API no devolvió execution_id.",
        fallbackError: "Error desconocido",
      });
    },
    [execute, setProgress]
  );

  const runAll = useCallback(
    () =>
      execute({
        targets: everyAgent,
        request: runAllPipeline,
        startMessage: "Ejecutando pipeline completo...",
        startTask: "Solicitando ejecución...",
        startedMessage: (id) => `Pipeline iniciado: ${id}`,
        missingIdMessage: "La API no devolvió execution_id.",
        fallbackError: "Error desconocido",
      }),
    [execute]
  );

  const runAfterUpload = useCallback(() => {
    const code = UPLOAD_FOLLOW_UP_AGENT;
    return execute({
      targets: byCode(code),
      request: () => runSingleAgent(code),
      startMessage: `Archivo confirmado. Ejecutando ${code}...`,
      startTask: `Archivo confirmado. Ejecutando ${code}...`,
      startedTask: (id) => `${code} iniciado: ${id}`,
      missingIdMessage: `La API no devolvió execution_id para ${code}.`,
      fallbackError: `Error desconocido ejecutando ${code}`,
    });
  }, [execute]);

  return {
    isExecuting,
    executionId,
    lastMessage,
    backendUnavailable,
    dismissBackendUnavailable,
    runAgent,
    runAll,
    runAfterUpload,
  };
}
