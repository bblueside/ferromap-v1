import type { Agent } from "../domain/agent";
import { AgentCard } from "./AgentCard";
import type { AgentCardProps } from "./types";

type AgentGridProps = Omit<AgentCardProps, "agent" | "records"> & {
  agents: Agent[];
  /** Nombre visible del agente → registros aportados. */
  recordsByAgent: Map<string, number | null>;
};

export function AgentGrid({ agents, recordsByAgent, ...handlers }: AgentGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} records={recordsByAgent.get(agent.name)} {...handlers} />
      ))}
    </div>
  );
}
