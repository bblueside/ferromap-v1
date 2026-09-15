import { useState } from "react";
import { Clock, Play } from "lucide-react";
import type { Agent } from "../domain/agent";
import { ModalShell } from "@/components/shared/modal/ModalShell";
import { ChoiceButton, FieldLabel, ModalButton, SummaryList, SummaryRow } from "@/components/shared/modal/modalPrimitives";

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const FREQUENCIES = ["Diaria", "Semanal", "Manual"];

interface AgentConfigModalProps {
  agent: Agent;
  onClose: () => void;
  onRunNow: () => void;
}

/** Programación de ejecución de un agente (solo UI; aún no se persiste). */
export function AgentConfigModal({ agent, onClose, onRunNow }: AgentConfigModalProps) {
  const [frequency, setFrequency] = useState("Semanal");
  const [time, setTime] = useState("14:30");
  const [selectedDay, setSelectedDay] = useState("Mi");

  const handleRunNow = () => {
    onRunNow();
    onClose();
  };

  return (
    <ModalShell title={agent.name} subtitle={`ID: ${agent.id}`} icon={agent.icon} onClose={onClose}>
      <div className="space-y-5 px-5 py-5">
        <div className="space-y-2">
          <FieldLabel>Frecuencia</FieldLabel>
          <div className="flex gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
            {FREQUENCIES.map((option) => (
              <ChoiceButton
                key={option}
                selected={frequency === option}
                onClick={() => setFrequency(option)}
                appearance="segment"
                className="flex-1 rounded-lg py-1.5 text-sm font-medium"
              >
                {option}
              </ChoiceButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Hora de ejecución</FieldLabel>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5">
            <input
              type="time"
              aria-label="Hora de ejecución"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-zinc-700 focus:outline-none"
            />
            <Clock size={15} className="shrink-0 text-zinc-400" />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Día de la semana</FieldLabel>
          <div className="flex gap-1.5">
            {DAYS.map((day) => (
              <ChoiceButton
                key={day}
                selected={selectedDay === day}
                onClick={() => setSelectedDay(day)}
                className="flex-1 rounded-xl py-2 text-xs font-semibold"
              >
                {day}
              </ChoiceButton>
            ))}
          </div>
        </div>

        <SummaryList>
          <SummaryRow label="Última ejecución automática">10:30</SummaryRow>
          <SummaryRow label="Próxima ejecución" valueClassName="ui-accent-text font-semibold">{time}</SummaryRow>
        </SummaryList>

        <div className="flex gap-2.5 pt-1">
          <ModalButton className="flex-1 font-semibold">Guardar configuración</ModalButton>
          <ModalButton variant="outline" className="gap-1.5 px-4" onClick={handleRunNow}>
            <Play size={13} className="fill-zinc-600 text-zinc-600" />
            Ejecutar ahora
          </ModalButton>
        </div>
      </div>
    </ModalShell>
  );
}
