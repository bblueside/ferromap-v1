import type { FetchState } from "@/services/http";
import type { AgentLog } from "@/services/control/controlService";
import { ApiStateLoading, ApiStateError } from "@/hooks/ApiStateWrapper";
import { useExecutionHistoryTable } from "../hooks/useExecutionHistoryTable";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryTable } from "./HistoryTable";

interface ExecutionHistoryProps {
  /** Estado del fetch a `/api/control/getAllAgentsLog` (lo hace `AgentManager`). */
  logs: FetchState<AgentLog[]>;
}

export function ExecutionHistory({ logs }: ExecutionHistoryProps) {
  const history = useExecutionHistoryTable(logs.data);

  if (logs.loading) return <ApiStateLoading>Cargando historial de ejecuciones...</ApiStateLoading>;
  if (logs.error || !logs.data) return <ApiStateError>{logs.error}</ApiStateError>;

  return (
    <div className="flex flex-col gap-6 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="ui-section-title">Historial de ejecuciones</h2>
        <HistoryFilters
          agentOptions={history.agentOptions}
          filters={history.filters}
          onSelectFilter={history.setSelectFilter}
          onDatePresetChange={history.setDatePreset}
          onCustomStartChange={history.setCustomStart}
          onCustomEndChange={history.setCustomEnd}
        />
      </div>

      <HistoryTable table={history.table} />
    </div>
  );
}
