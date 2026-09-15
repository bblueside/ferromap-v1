import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EXECUTION_STATUS_META, metaFor, type ExecutionStatus, toneClass } from "@/constants";

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  const { label, tone } = metaFor(EXECUTION_STATUS_META, status, EXECUTION_STATUS_META.failed);
  return (
    <Badge variant="outline" className={cn(toneClass(tone, "badge"), "flex w-fit items-center gap-1.5")}>
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", toneClass(tone, "dot"), status === "running" && "animate-pulse")}
      />
      {label}
    </Badge>
  );
}
