import { useCallback, useState } from "react";
import {
  commitNormalizationPreview,
  fetchNormalizationPreview,
  type NormalizationPreview,
} from "@/services/control/normalizationPreviewService";

/** Estado del flujo subir → preview → confirmar del agente `agentId`. */
export function useNormalizationPreview(agentId: string) {
  const [preview, setPreview] = useState<NormalizationPreview | null>(null);

  /** Carga el preview del primer archivo subido; si falla, rechaza hacia quien subió. */
  const loadPreview = useCallback(
    async (files: File[]) => {
      const [file] = files;
      if (file) setPreview(await fetchNormalizationPreview(agentId, file));
    },
    [agentId]
  );

  const confirmPreview = useCallback(() => commitNormalizationPreview(agentId), [agentId]);
  const closePreview = useCallback(() => setPreview(null), []);

  return { preview, loadPreview, confirmPreview, closePreview };
}
