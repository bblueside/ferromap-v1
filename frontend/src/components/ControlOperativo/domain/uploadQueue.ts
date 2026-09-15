/** Modelo de la cola de archivos del modal de subida. Sin React. */

import type { UploadItemStatus } from "@/constants";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface UploadItem {
  id: number;
  file: File;
  status: UploadItemStatus;
  /** 0–100; progreso local mientras el archivo se prepara. */
  progress: number;
}

export function createUploadItem(id: number, file: File): UploadItem {
  return file.size > MAX_FILE_SIZE_BYTES
    ? { id, file, status: "error", progress: 0 }
    : { id, file, status: "uploading", progress: 0 };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function summarizeQueue(items: UploadItem[]) {
  const doneCount = items.filter((item) => item.status === "done").length;
  return {
    doneCount,
    total: items.length,
    allDone: items.length > 0 && doneCount === items.length,
    isPreparing: items.some((item) => item.status === "uploading"),
  };
}
