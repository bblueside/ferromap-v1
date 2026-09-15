import { useCallback, useState } from "react";
import type { Agent } from "../domain/agent";
import {
  applyStageProgress,
  everyAgent,
  toggleAutoById,
  updateWhere,
  type AgentProgress,
  type CodedProgress,
} from "../domain/agentRoster";

/** Estado de la lista de agentes: una sola fuente de verdad para todas las tarjetas. */
export function useAgentRoster(initialAgents: Agent[]) {
  const [agents, setAgents] = useState(initialAgents);
  const [globalAuto, setGlobalAuto] = useState(true);

  const toggleAuto = useCallback((agent: Agent) => {
    setAgents((prev) => toggleAutoById(prev, agent.id));
  }, []);

  const toggleGlobalAuto = useCallback(() => {
    const next = !globalAuto;
    setGlobalAuto(next);
    setAgents((prev) => updateWhere(prev, everyAgent, { auto: next }));
  }, [globalAuto]);

  const setProgress = useCallback(
    (matches: (agent: Agent) => boolean, progress: AgentProgress) => {
      setAgents((prev) => updateWhere(prev, matches, progress));
    },
    []
  );

  const applyStages = useCallback((stages: CodedProgress[]) => {
    setAgents((prev) => applyStageProgress(prev, stages));
  }, []);

  return { agents, globalAuto, toggleAuto, toggleGlobalAuto, setProgress, applyStages };
}
