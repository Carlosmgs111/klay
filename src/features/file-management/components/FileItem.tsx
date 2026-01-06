import { useState } from "react";
import { useStore } from "@nanostores/react";
import TimeAgo from "javascript-time-ago";
import type { FileData } from "../types";
import { selectionMode } from "../stores/selectionMode";
import { fileStore, setStagedFiles } from "../stores/files";

interface FileItemProps {
  file: FileData;
  onDelete: (id: string) => Promise<void>;
  onDetail: (id: string) => Promise<void>;
  timeAgo: TimeAgo;
}

export default function FileItem({ file, onDelete, onDetail, timeAgo }: FileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const mode = useStore(selectionMode);
  const files = useStore(fileStore);
  const isSelected = files.stagedIndexes.includes(file.id);

  const handleDelete = async () => {
    const result = window.confirm(
      "Esta a punto de eliminar el archivo, esta seguro de continuar?"
    );
    if (result) {
      setIsDeleting(true);
      try {
        await onDelete(file.id);
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("Error al eliminar el archivo");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDetail = async () => {
    try {
      await onDetail(file.id);
    } catch (error) {
      console.error("Error getting file details:", error);
    }
  };

  const handleFileClick = () => {
    if (!mode) return;

    if (isSelected) {
      // Deseleccionar archivo
      setStagedFiles(files.stagedIndexes.filter((id) => id !== file.id));
    } else {
      // Seleccionar archivo (solo uno a la vez)
      setStagedFiles([file.id]);
    }
  };

  return (
    <li
      id="file-index"
      data-id={file.id}
      onClick={handleFileClick}
      className={`hover:bg-gray-700/30 transition-all table-row border rounded-lg whitespace-nowrap !max-w-[50px] ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      } ${isSelected ? "bg-gray-700/50" : ""} ${mode ? "cursor-pointer" : ""}`}
    >
      <span className="p-4 w-full font-thin table-cell flex justify-between gap-2">
        <label className={`${mode ? "" : "hidden"}`} id="file-is-selected">
          {isSelected ? "✅" : "🔲"}
        </label>
        <label className="w-full">{file.name}</label>
      </span>
      <span className="p-4 whitespace-nowrap table-cell">
        {timeAgo.format(file.lastModified)}
      </span>
      <span className="p-4 whitespace-nowrap table-cell">
        {new Intl.NumberFormat("es-ES", {
          style: "unit",
          unit: "kilobyte",
        }).format(Math.round(file.size / 1024))}
      </span>
      <div className="flex gap-1 p-4 sticky right-0 bg-slate-900 border-l border-slate-700">
        <button
          className="h-fit rounded-lg bx bx-file-detail text-gray-500 p-2 hover:bg-gray-500/50 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            handleDetail();
          }}
          title="Ver Detalles"
          disabled={isDeleting || mode}
        />
        <button
          className="h-fit rounded-lg bx bx-edit text-gray-500 p-2 hover:bg-gray-500/50 transition-all"
          onClick={(e) => e.stopPropagation()}
          title="Editar Nombre"
          disabled={isDeleting || mode}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="h-fit bx bx-trash text-red-500 p-2 rounded-lg hover:bg-red-500/50 transition-all table-cell"
          title="Eliminar"
          disabled={isDeleting || mode}
        />
      </div>
    </li>
  );
}
