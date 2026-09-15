import { useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";

interface DropZoneProps {
  /** Formatos aceptados, solo informativo (p. ej. "CSV"). */
  acceptedFormats?: string;
  onFiles: (files: FileList) => void;
}

/** Área de arrastrar/soltar + selector de archivos del dispositivo. */
export function DropZone({ acceptedFormats, onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        data-dragging={dragging}
        className="ui-dropzone"
      >
        <div className="ui-dropzone-icon">
          <Upload size={18} />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-zinc-600">{dragging ? "Suelta para agregar" : "Arrastra archivos aquí"}</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            o <span className="ui-accent-text font-medium">selecciona desde tu dispositivo</span>
          </p>
        </div>
        {acceptedFormats && (
          <p className="text-[10px] font-medium tracking-wide text-zinc-300 uppercase">{acceptedFormats}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </>
  );
}
