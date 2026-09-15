import { AlertCircle, CheckCircle2, File, FileText, Film, Image, Loader2, Music, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UPLOAD_ITEM_STATUS_META, type UploadItemStatus, toneClass } from "@/constants";
import { formatFileSize, type UploadItem } from "../../domain/uploadQueue";

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image size={16} className="ui-file-icon-image" />;
  if (mimeType.startsWith("video/")) return <Film size={16} className="ui-file-icon-video" />;
  if (mimeType.startsWith("audio/")) return <Music size={16} className="ui-file-icon-audio" />;
  if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText size={16} className="ui-file-icon-document" />;
  return <File size={16} className="ui-file-icon-other" />;
}

const STATUS_ICON: Record<UploadItemStatus, ReactNode> = {
  uploading: <Loader2 size={10} className="animate-spin" />,
  done: <CheckCircle2 size={10} />,
  error: <AlertCircle size={10} />,
};

function UploadStatusBadge({ status }: { status: UploadItemStatus }) {
  const { label, tone } = UPLOAD_ITEM_STATUS_META[status];
  return (
    <span className={cn("ui-chip", toneClass(tone, "badge"))}>
      {STATUS_ICON[status]} {label}
    </span>
  );
}

export function FileRow({ item, onRemove }: { item: UploadItem; onRemove: (id: number) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-white">
        <FileTypeIcon mimeType={item.file.type} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs leading-tight font-medium text-zinc-700">{item.file.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">{formatFileSize(item.file.size)}</span>
          <UploadStatusBadge status={item.status} />
        </div>
        {item.status === "uploading" && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
            <div className={cn("h-full rounded-full transition-all duration-300", toneClass("info", "bar"))} style={{ width: `${item.progress}%` }} />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Quitar ${item.file.name}`}
        className="ui-remove-button"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
