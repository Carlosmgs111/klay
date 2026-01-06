import { useEffect, useState } from "react";
import TimeAgo from "javascript-time-ago";
import es from "javascript-time-ago/locale/es";
import FileItem from "./FileItem";
import LibraryFileSelector from "./LibraryFileSelector";
import { setFiles } from "../stores/files";
import type { FilesApi } from "@/modules/files/@core-contracts/api";
import type { FileData, ExecEnvironment } from "../types";

TimeAgo.addLocale(es);

interface FileListProps {
  execEnv: ExecEnvironment;
}

export default function FileList({ execEnv }: FileListProps) {
  const [files, setFilesState] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filesApi, setFilesApi] = useState<FilesApi | null>(null);
  const timeAgo = new TimeAgo("es-ES");

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);

        if (execEnv === "browser") {
          // Importación dinámica del filesApiFactory con configuración browser
          const { filesApiFactory } = await import("@/modules/files/index");
          const api = await filesApiFactory({
            storage: "browser-mock",
            repository: "browser",
          });
          setFilesApi(api);

          const loadedFiles = await api.getFiles();
          setFilesState(loadedFiles as FileData[]);

          // Actualizar el store de nanostores
          const indexedFiles: { [key: string]: any } = {};
          loadedFiles.forEach((file: any) => {
            indexedFiles[file.id] = file;
          });
          setFiles(indexedFiles);
        } else {
          // Usar la API del servidor
          const response = await fetch("/api/file");
          if (!response.ok) {
            throw new Error("Error al cargar los archivos");
          }
          const loadedFiles = await response.json();
          setFilesState(loadedFiles);

          // Actualizar el store de nanostores
          const indexedFiles: { [key: string]: any } = {};
          loadedFiles.forEach((file: any) => {
            indexedFiles[file.id] = file;
          });
          setFiles(indexedFiles);
        }
      } catch (err) {
        console.error("Error loading files:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [execEnv]);

  const handleDelete = async (id: string) => {
    if (execEnv === "browser" && filesApi) {
      // Usar la API del browser
      const res = await filesApi.deleteFile(id);
      console.log({ res });
      setFilesState((prev) => prev.filter((f) => f.id !== id));
    } else {
      // Usar la API del servidor
      const res = await fetch(`/api/file/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFilesState((prev) => prev.filter((f) => f.id !== id));
      } else {
        throw new Error("Error al eliminar el archivo");
      }
    }
  };

  const handleDetail = async (id: string) => {
    if (execEnv === "browser" && filesApi) {
      // Usar la API del browser
      const file = await filesApi.getFileById(id);
      console.log({ file });
      // Aquí puedes mostrar un modal o panel con los detalles
    } else {
      // Usar la API del servidor
      const res = await fetch(`/api/file/${id}`, {
        method: "GET",
      });
      const file = await res.json();
      console.log({ file });
      // Aquí puedes mostrar un modal o panel con los detalles
    }
  };

  if (loading) {
    return (
      <div className="text-gray-200 p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
          <span className="ml-3">Cargando archivos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-gray-200 p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="text-red-500 p-4">Error: {error}</div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-gray-200 p-12 bg-gray-800/50 border border-gray-700/50 rounded-lg">
        <span className="block text-gray-200 font-semibold text-xl px-4 w-full text-center">
          Aun no tienes ningun archivo.
        </span>
      </div>
    );
  }

  return (
    <div className="text-slate-200 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
      <span className="block text-slate-200 mb-2 font-semibold text-lg px-4 pb-2 w-full">
        Archivos
      </span>
      <span className="block text-slate-200 mb-2 font-thin text-sm px-4 pb-2 w-full border-b border-slate-700/50">
        Archivos guardados en la biblioteca
      </span>
      <LibraryFileSelector />

      <div className="overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        <ul className="w-full flex flex-wrap table mb-2">
          <li className="font-semibold text-lg table-row">
            <span className="p-4 w-full table-cell">Nombre</span>
            <span className="p-4 whitespace-nowrap table-cell">
              Ultima modificacion
            </span>
            <span className="p-4 whitespace-nowrap table-cell">Tamaño</span>
            <span className="p-4 whitespace-nowrap table-cell sticky right-0 bg-slate-900 border-l border-slate-700">
              Acciones
            </span>
          </li>
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={handleDelete}
              onDetail={handleDetail}
              timeAgo={timeAgo}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
