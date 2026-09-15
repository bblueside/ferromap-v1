import { Button } from "@/components/ui/button";

interface ControlHeaderProps {
  executionId: string | null;
  lastMessage: string | null;
  globalAuto: boolean;
  isExecuting: boolean;
  onToggleGlobalAuto: () => void;
  onRunAll: () => void;
  onRefresh: () => void;
}

export function ControlHeader({
  executionId,
  lastMessage,
  globalAuto,
  isExecuting,
  onToggleGlobalAuto,
  onRunAll,
  onRefresh,
}: ControlHeaderProps) {
  return (
    <div className="flex items-center justify-between py-8">
      <div className="flex flex-col gap-2">
        <h1 className="ui-page-title">Control operativo</h1>
        <p className="ui-page-subtitle">Centraliza la ejecución de tu ecosistema de IA</p>
        {executionId && <p className="ui-page-meta">Última ejecución: {executionId}</p>}
        {lastMessage && (
          <p className="text-xs text-slate-500" aria-live="polite">
            {lastMessage}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onToggleGlobalAuto}>
          Auto: {globalAuto ? "ON" : "OFF"}
        </Button>
        <Button onClick={onRunAll} disabled={isExecuting} className="ui-btn-brand">
          {isExecuting ? "Ejecutando..." : "Ejecutar agentes"}
        </Button>
        <Button onClick={onRefresh} className="ui-btn-brand">
          Refresh
        </Button>
      </div>
    </div>
  );
}
