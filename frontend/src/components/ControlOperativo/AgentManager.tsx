/**
 * Raíz de la pestaña Control Operativo. Solo compone: el estado de los agentes
 * vive en `useAgentRoster`, las ejecuciones en `usePipelineRunner` y las
 * lecturas de `/api/control` en `useControlData`.
 */

import { useMemo } from "react";
import { BackendUnavailableModal } from "@/components/shared/modal/BackendUnavailableModal";
import { AGENTS } from "./agents/agentCatalog";
import { AgentGrid } from "./agents/AgentGrid";
import { inLayoutGroup } from "./domain/agentRoster";
import { ControlHeader } from "./header/ControlHeader";
import { ExecutionHistory } from "./history/ExecutionHistory";
import { useAgentRoster } from "./hooks/useAgentRoster";
import { useControlData } from "./hooks/useControlData";
import { usePipelineRunner } from "./hooks/usePipelineRunner";

export function AgentManager() {
  const { agentsLog, recordsByAgent, refresh } = useControlData();
  const { agents, globalAuto, toggleAuto, toggleGlobalAuto, setProgress, applyStages } = useAgentRoster(AGENTS);
  const runner = usePipelineRunner({ setProgress, applyStages, onExecutionFinished: refresh });

  const primaryAgents = useMemo(() => inLayoutGroup(agents, "primary"), [agents]);
  const secondaryAgents = useMemo(() => inLayoutGroup(agents, "secondary"), [agents]);

  const cardHandlers = {
    recordsByAgent,
    onToggleAuto: toggleAuto,
    onRun: runner.runAgent,
    onUploadCompleted: runner.runAfterUpload,
  };

  return (
    <div className="w-full bg-slate-50">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-12 pt-25 pb-16">
        <ControlHeader
          executionId={runner.executionId}
          lastMessage={runner.lastMessage}
          globalAuto={globalAuto}
          isExecuting={runner.isExecuting}
          onToggleGlobalAuto={toggleGlobalAuto}
          onRunAll={runner.runAll}
          onRefresh={refresh}
        />

        <AgentGrid agents={primaryAgents} {...cardHandlers} />
        <AgentGrid agents={secondaryAgents} {...cardHandlers} />

        <ExecutionHistory logs={agentsLog} />
      </div>

      {runner.backendUnavailable && <BackendUnavailableModal onClose={runner.dismissBackendUnavailable} />}
    </div>
  );
}

export default AgentManager;
