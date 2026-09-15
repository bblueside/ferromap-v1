import { useCallback, useMemo } from "react";
import { useApiResource } from "@/services/http";
import { fetchAllAgentRecords, fetchAllAgentsLog } from "@/services/control/controlService";

/** Lecturas de `/api/control`: historial de ejecuciones y registros por agente. */
export function useControlData() {
  const agentsLog = useApiResource(fetchAllAgentsLog);
  const agentRecords = useApiResource(fetchAllAgentRecords);
  const { refetch: refetchLog } = agentsLog;
  const { refetch: refetchRecords } = agentRecords;

  // Nombre visible del agente → cantidad de registros aportados.
  const recordsByAgent = useMemo(
    () => new Map((agentRecords.data ?? []).map((record) => [record.name, record.quantity])),
    [agentRecords.data]
  );

  const refresh = useCallback(() => {
    refetchLog();
    refetchRecords();
  }, [refetchLog, refetchRecords]);

  return { agentsLog, recordsByAgent, refresh };
}
