import { InputDataAgentCard } from "./InputDataAgentCard";
import { StandardAgentCard } from "./StandardAgentCard";
import type { AgentCardProps } from "./types";

/** Elige la tarjeta según `agent.variant`. Nueva variante = nuevo `case`. */
export function AgentCard(props: AgentCardProps) {
  switch (props.agent.variant) {
    case "inputData":
      return <InputDataAgentCard {...props} />;
    case "standard":
      return <StandardAgentCard {...props} />;
  }
}
