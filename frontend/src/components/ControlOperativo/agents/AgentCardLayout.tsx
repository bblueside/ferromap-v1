import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Agent } from "../domain/agent";
import { AGENT_STATUS_TONE, toneClass } from "@/constants";

interface AgentCardLayoutProps {
  agent: Agent;
  records?: number | null;
  /** Controles del pie; `footerAlign` define su distribución. */
  footer: ReactNode;
  footerAlign?: "between" | "end";
}

/** Estructura visual compartida por todas las tarjetas de agente. */
export function AgentCardLayout({ agent, records, footer, footerAlign = "between" }: AgentCardLayoutProps) {
  return (
    <Card className="flex min-w-0 flex-1 flex-col shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">{agent.icon}</div>
            <span className="text-lg font-semibold text-slate-900">{agent.name}</span>
          </div>
          <Badge variant="outline" className={toneClass(AGENT_STATUS_TONE[agent.status], "badge")}>
            {agent.status}
          </Badge>
        </div>

        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">Current Task:</span> {agent.task}
        </p>

        {records != null && (
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">Registros aportados:</span> {records.toLocaleString("es-CO")}
          </p>
        )}
      </CardContent>

      <CardFooter
        className={cn(
          "mt-auto flex flex-wrap items-center gap-3 px-6 py-6",
          footerAlign === "end" ? "justify-end" : "justify-between"
        )}
      >
        {footer}
      </CardFooter>
    </Card>
  );
}
