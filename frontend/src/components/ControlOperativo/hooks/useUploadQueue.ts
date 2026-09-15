import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createUploadItem, summarizeQueue, type UploadItem } from "../domain/uploadQueue";

const PROGRESS_TICK_MS = 300;

/**
 * Cola de archivos seleccionados en el modal de subida. Cada archivo válido
 * muestra un progreso local simulado antes de poder confirmarse; los timers
 * se limpian al quitar el archivo o desmontar el modal.
 */
export function useUploadQueue() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setInterval>>());

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(clearInterval);
  }, []);

  const stopTimer = useCallback((id: number) => {
    clearInterval(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const simulateProgress = useCallback(
    (id: number) => {
      let progress = 0;
      const timer = setInterval(() => {
        progress += Math.random() * 25 + 5;
        const done = progress >= 100;
        if (done) stopTimer(id);
        setItems((prev) =>
          prev.map((item) =>
            item.id !== id
              ? item
              : done
                ? { ...item, status: "done", progress: 100 }
                : { ...item, progress: Math.min(progress, 99) }
          )
        );
      }, PROGRESS_TICK_MS);
      timers.current.set(id, timer);
    },
    [stopTimer]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const added = Array.from(files).map((file) => createUploadItem(++nextId.current, file));
      setItems((prev) => [...prev, ...added]);
      added.filter((item) => item.status === "uploading").forEach((item) => simulateProgress(item.id));
    },
    [simulateProgress]
  );

  const removeFile = useCallback(
    (id: number) => {
      stopTimer(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [stopTimer]
  );

  const summary = useMemo(() => summarizeQueue(items), [items]);

  return { items, summary, addFiles, removeFile };
}
