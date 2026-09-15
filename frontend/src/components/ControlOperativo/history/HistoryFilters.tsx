import { Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXECUTION_STATUSES, EXECUTION_STATUS_META } from "@/constants";
import { DATE_PRESET_OPTIONS, type DatePreset } from "../domain/executionHistory";
import type { SelectFilterColumn } from "../hooks/useExecutionHistoryTable";

interface HistoryFiltersProps {
  agentOptions: string[];
  filters: {
    agent: string;
    status: string;
    datePreset: DatePreset;
    customStart: string;
    customEnd: string;
  };
  onSelectFilter: (column: SelectFilterColumn, value: string) => void;
  onDatePresetChange: (preset: DatePreset) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}

export function HistoryFilters({
  agentOptions,
  filters,
  onSelectFilter,
  onDatePresetChange,
  onCustomStartChange,
  onCustomEndChange,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.agent} onValueChange={(value) => onSelectFilter("agent", value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los Agentes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Agentes</SelectItem>
          {agentOptions.map((agent) => (
            <SelectItem key={agent} value={agent}>{agent}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => onSelectFilter("status", value)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {EXECUTION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>{EXECUTION_STATUS_META[status].label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.datePreset} onValueChange={(value) => onDatePresetChange(value as DatePreset)}>
        <SelectTrigger className="w-52">
          <Timer className="mr-1 h-4 w-4 text-slate-500" />
          <SelectValue placeholder="Cualquier fecha" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESET_OPTIONS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filters.datePreset === "custom" && (
        <div className="flex animate-in fade-in zoom-in-95 items-center gap-2 duration-200">
          <Input
            type="date"
            aria-label="Fecha inicial"
            value={filters.customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="w-40"
          />
          <span className="text-slate-400">–</span>
          <Input
            type="date"
            aria-label="Fecha final"
            value={filters.customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="w-40"
          />
        </div>
      )}
    </div>
  );
}
