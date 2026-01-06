import { useStore } from "@nanostores/react";
import { selectionMode } from "../stores/selectionMode";
import { fileStore, setStagedFiles } from "../stores/files";
import Switch from "@/shared/components/Switch";
import { navigate } from "astro:transitions/client";

export default function LibraryFileSelector() {
  const mode = useStore(selectionMode);
  const files = useStore(fileStore);
  const selectedFileId = files.stagedIndexes[0];
  const hasSelectedFile = Boolean(selectedFileId);

  console.log({ mode });

  const handleContinue = () => {
    if (!selectedFileId) return;
    const file = files.files[selectedFileId];
    if (!file) return;
    navigate(
      `/dashboard/generator?fileId=${selectedFileId}&fileName=${file.name}`
    );
  };

  return (
    <div
      id="mode-select-container"
      data-mode={mode ? "select" : ""}
      className={`px-4 py-2 border-b border-slate-700/50 flex flex-wrap gap-2 b ${
        mode ? "sticky top-0 z-10" : ""
      }`}
    >
      <div className="flex gap-2 w-full items-center sticky top-0 z-10 ">
        <div className="w-full">
          <Switch id="mode-select" label="Activar seleccion de archivo" />
        </div>
        <button
          id="mode-select:add-file"
          onClick={handleContinue}
          disabled={!hasSelectedFile}
          className={`bg-gray-700/50 text-sm hover:bg-gray-700 py-2 px-4 rounded-lg whitespace-nowrap transition-all ${
            !mode ? "opacity-0 pointer-events-none" : ""
          } ${mode && !hasSelectedFile ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <i className="bx bxs-arrow-to-right-stroke mr-2 align-middle text-xl"></i>{" "}
          Continuar
        </button>
      </div>
      <span className="text-xs w-full">
        Activa el modo de seleccion para agregar un archivo de la biblioteca al
        contexto de generacion de MindMap
      </span>
    </div>
  );
}
