import { useState } from "react";
import { Download, FileText, Sheet, type LucideIcon } from "lucide-react";
import { toneClass } from "@/constants";
import { ModalShell } from "@/components/shared/modal/ModalShell";
import { ChoiceButton, FieldLabel, ModalButton, SummaryList, SummaryRow } from "@/components/shared/modal/modalPrimitives";

type OutputFormat = "excel" | "csv";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; icon: LucideIcon }[] = [
  { value: "excel", label: "Excel", icon: Sheet },
  { value: "csv", label: "CSV", icon: FileText },
];

/** Selección de formato de exportación (solo UI; la exportación aún no existe). */
export function ExportOutputModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<OutputFormat>("excel");

  return (
    <ModalShell title="Exportar" icon={<FileText size={16} className="text-zinc-500" />} onClose={onClose}>
      <div className="space-y-5 px-5 py-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Download size={11} className="text-zinc-400" />
            <FieldLabel>Tipo de salida</FieldLabel>
          </div>
          <div className="flex gap-2">
            {FORMAT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <ChoiceButton
                key={value}
                selected={format === value}
                onClick={() => setFormat(value)}
                appearance="card"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium"
              >
                <Icon size={14} className={format === value ? toneClass("success", "text") : "text-zinc-300"} />
                {label}
              </ChoiceButton>
            ))}
          </div>
        </div>

        <SummaryList>
          <SummaryRow label="Registros estimados" valueClassName="font-semibold text-zinc-700">~1.250</SummaryRow>
          <SummaryRow label="Formato de salida" valueClassName="ui-accent-text font-semibold uppercase">{format}</SummaryRow>
        </SummaryList>

        <div className="flex gap-2.5 pt-1">
          <ModalButton className="flex-1 font-semibold shadow-sm">
            <Download size={14} />
            Exportar
          </ModalButton>
          <ModalButton variant="outline" className="px-4" onClick={onClose}>
            Cancelar
          </ModalButton>
        </div>
      </div>
    </ModalShell>
  );
}
