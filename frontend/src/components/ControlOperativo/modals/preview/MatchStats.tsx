import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MATCH_STATUSES, MATCH_STATUS_META, type Tone, toneClass } from "@/constants";
import type { MatchSummary } from "@/services/control/normalizationPreviewService";

const STATS: { key: keyof MatchSummary; label: string; tone: Tone; icon: ReactNode }[] = [
  { key: "total", label: "Total", tone: "neutral", icon: <Users size={16} /> },
  { key: "newRecords", label: "Nuevos", tone: MATCH_STATUS_META.new.tone, icon: <MapPin size={16} /> },
  { key: "matched", label: "Matches", tone: MATCH_STATUS_META.match.tone, icon: <CheckCircle2 size={16} /> },
  { key: "invalid", label: "Inválidos", tone: "danger", icon: <AlertTriangle size={16} /> },
];

/** Tarjetas con el resumen de coincidencias del archivo contra el mapa. */
export function MatchStats({ summary }: { summary: MatchSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map(({ key, label, tone, icon }) => (
        <div key={key} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", toneClass(tone, "surface"))}>
          <div className="text-current opacity-80">{icon}</div>
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase opacity-70">{label}</p>
            <p className={cn("text-xl leading-tight font-bold", toneClass(tone, "value"))}>{summary[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MatchLegend() {
  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
      {MATCH_STATUSES.map((status) => {
        const { label, legend, tone } = MATCH_STATUS_META[status];
        return (
          <span key={status} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2 w-2 rounded-full", toneClass(tone, "dot"))} />
            <strong className="text-slate-600">{label}</strong> — {legend}
          </span>
        );
      })}
    </div>
  );
}
