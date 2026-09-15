import { Play, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Agent } from "../domain/agent";

export function AgentActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}

export function RunAgentButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="ui-btn-brand-hover"
    >
      <Play className="h-4 w-4" />
      Run
    </Button>
  );
}

export function AgentAutoToggle({ agent, onToggle }: { agent: Agent; onToggle: (agent: Agent) => void }) {
  const switchId = `auto-${agent.id}`;
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={switchId} className="text-sm text-slate-500">
        Auto
      </Label>
      <Switch id={switchId} checked={agent.auto} onCheckedChange={() => onToggle(agent)} />
    </div>
  );
}
