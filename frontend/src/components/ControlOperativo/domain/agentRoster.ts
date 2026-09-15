/**
 * Operaciones puras (sin React) sobre la lista de agentes de Control Operativo.
 * `useAgentRoster` las envuelve en estado; aquí solo viven las reglas.
 */

import type { Agent, AgentLayoutGroup } from "./agent";
import type { AgentStatus } from "@/constants";
import type { AgentCode } from "@/services/pipelineService";
import { getAgentCodeFromName } from "@/services/agentAdapter";

/** Cambio de estado visible de un agente. */
export type AgentProgress = { status: AgentStatus; task: string };

/** Progreso reportado por el pipeline para el agente con código `code`. */
export type CodedProgress = AgentProgress & { code: AgentCode };

export function updateWhere(
  agents: Agent[],
  matches: (agent: Agent) => boolean,
  patch: Partial<Agent>
): Agent[] {
  return agents.map((agent) => (matches(agent) ? { ...agent, ...patch } : agent));
}

export const byId = (id: string) => (agent: Agent) => agent.id === id;

export const byCode = (code: AgentCode) => (agent: Agent) =>
  getAgentCodeFromName(agent.name) === code;

export const everyAgent = () => true;

/**
 * Aplica el progreso de varias etapas en una sola pasada. Si dos etapas
 * reportan el mismo código, gana la última.
 */
export function applyStageProgress(agents: Agent[], stages: CodedProgress[]): Agent[] {
  if (stages.length === 0) return agents;
  const latestByCode = new Map(stages.map(({ code, status, task }) => [code, { status, task }]));
  return agents.map((agent) => {
    const code = getAgentCodeFromName(agent.name);
    const progress = code ? latestByCode.get(code) : undefined;
    return progress ? { ...agent, ...progress } : agent;
  });
}

export function toggleAutoById(agents: Agent[], id: string): Agent[] {
  return agents.map((agent) => (agent.id === id ? { ...agent, auto: !agent.auto } : agent));
}

export function inLayoutGroup(agents: Agent[], group: AgentLayoutGroup): Agent[] {
  return agents.filter((agent) => agent.layoutGroup === group);
}
