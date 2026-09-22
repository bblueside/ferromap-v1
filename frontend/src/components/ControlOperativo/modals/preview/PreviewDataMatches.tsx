import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModalOverlay, ModalShell } from "@/components/shared/modal/ModalShell";
import { ModalError } from "@/components/shared/modal/modalPrimitives";
import { MATCH_STATUS_META, toneClass } from "@/constants";
import { cn } from "@/lib/utils";
import type { NormalizationPreview } from "@/services/control/normalizationPreviewService";
import {
  filterPreviewRows,
  PREVIEW_FILTER_OPTIONS,
  type PreviewFilter,
} from "../../domain/normalizationPreview";
import { errorMessage } from "../../domain/errors";
import { MatchLegend, MatchStats } from "./MatchStats";
import { PreviewTable } from "./PreviewTable";

interface PreviewDataMatchesProps {
  preview: NormalizationPreview;
  /** Persiste la carga; si rechaza, el error se muestra y el modal sigue abierto. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Preview de datos normalizados + confirmación final de la carga. */
export function PreviewDataMatches({ preview, onConfirm, onClose }: PreviewDataMatchesProps) {
  const [filter, setFilter] = useState<PreviewFilter>("all");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const { rows, summary, fileName } = preview;
  const visibleRows = useMemo(() => filterPreviewRows(rows, filter), [rows, filter]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await onConfirm();
      setConfirmed(true);
    } catch (error) {
      setConfirmError(errorMessage(error, "No se pudo confirmar la carga"));
    } finally {
      setIsConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white px-10 py-10 text-center shadow-2xl">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-full border", toneClass("success", "surface"))}>
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">¡Datos cargados!</p>
            <p className="mt-1 text-sm text-slate-500">
              {summary.newRecords} registros nuevos y {summary.matched} actualizados en el mapa.
            </p>
          </div>
          <Button onClick={onClose} className="ui-btn-brand mt-2 h-10 w-full rounded-xl font-semibold">
            Cerrar
          </Button>
        </div>
      </ModalOverlay>
    );
  }

  const footer = (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
      <p className="hidden text-xs text-slate-400 sm:block">
        Se añadirán{" "}
        <span className={cn("font-semibold", toneClass(MATCH_STATUS_META.new.tone, "text"))}>{summary.newRecords} nuevos</span> y
        actualizarán <span className={cn("font-semibold", toneClass(MATCH_STATUS_META.match.tone, "text"))}>{summary.matched}</span> al mapa.
      </p>
      <div className="ml-auto flex gap-2.5">
        <Button variant="outline" className="h-10 rounded-xl px-4 text-sm font-medium" onClick={onClose} disabled={isConfirming}>
          Cancelar
        </Button>
        <Button
          className="ui-btn-brand flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
          onClick={handleConfirm}
          disabled={isConfirming || rows.length === 0}
        >
          {isConfirming ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Confirmando…
            </>
          ) : (
            <>
              Confirmar carga
              <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <ModalShell
      size="lg"
      title="Preview de datos normalizados"
      subtitle={fileName && <span className="font-mono">{fileName}</span>}
      icon={<Sparkles size={16} />}
      iconVariant="brand"
      onClose={onClose}
      footer={footer}
    >
      <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
        <MatchStats summary={summary} />
        <MatchLegend />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Vista previa — {visibleRows.length} registros
            </p>
            <Select value={filter} onValueChange={(value) => setFilter(value as PreviewFilter)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREVIEW_FILTER_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PreviewTable rows={visibleRows} />
        </div>

        {confirmError && <ModalError>{confirmError}</ModalError>}
      </div>
    </ModalShell>
  );
}
