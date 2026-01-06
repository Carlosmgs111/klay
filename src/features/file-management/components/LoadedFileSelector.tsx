import { useState, useEffect, useRef } from "react";
import { fileStore, setStagedFiles, setFiles } from "../stores/files";
import { sc } from "@/shared/utils/sc";
import { filesApiFactory } from "@/backend/files";

const filesApi = await filesApiFactory({
  storage: "browser-mock",
  repository: "browser",
});

interface LoadedFileSelectorProps {
  uploadEndpoint?: string;
  id?: string;
  className?: string;
}

export default function LoadedFileSelector({
  uploadEndpoint,
  id,
  className = "",
}: LoadedFileSelectorProps) {
  const [fileName, setFileName] = useState<string>(
    "Haz clic para seleccionar archivo"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Restaurar archivo del estado al montar el componente
    const fileStored = fileStore.get();
    if (
      fileStored.stagedIndexes[0] &&
      fileStored.files[fileStored.stagedIndexes[0]] instanceof File
    ) {
      const file = fileStored.files[fileStored.stagedIndexes[0]] as File;
      setFileName(file.name);

      // Restaurar el archivo en el input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log({ files });
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map((file: File) => {
        const fileId = crypto.randomUUID();
        const currentFiles = { ...fileStore.get().files, [fileId]: file };
        setFiles(currentFiles);
        setStagedFiles([fileId]);
        return file.name;
      });
      setFileName(fileNames.join(", "));
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fileInputRef.current?.files) {
      return;
    }

    if (fileInputRef.current.files.length === 0) {
      alert("No se seleccionó ningún archivo");
      return;
    }

    // if (!uploadEndpoint) {
    //   alert("No se proporcionó un endpoint");
    //   return;
    // }

    const formData = new FormData();
    Array.from(fileInputRef.current.files).forEach((file) => {
      formData.append("file", file);
    });

    const fileUploadDTO = {
      id: crypto.randomUUID(),
      name: fileInputRef.current.files[0].name,
      type: fileInputRef.current.files[0].type,
      size: fileInputRef.current.files[0].size,
      lastModified: new Date().getTime(),
      buffer: new Uint8Array(
        await fileInputRef.current.files[0].arrayBuffer()
      ) as Buffer,
      url: "",
    };

    const res = await filesApi.uploadFile(fileUploadDTO);
    console.log({ res });
    if (res) {
      window.location.reload();
    }
  };

  return (
    <form
      id={id}
      className={sc("flex gap-2 items-center text-gray-200  font-thin")}
      onSubmit={handleUpload}
    >
      <input
        ref={fileInputRef}
        className="hidden"
        id="fileInput"
        type="file"
        name="file"
        accept=".pdf"
        onChange={handleFileChange}
      />
      <label
        id="fileLabel"
        className={sc(
          "w-full p-4 hover:bg-gray-700/50 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer flex items-center",
          className
        )}
        htmlFor="fileInput"
      >
        <i className="bx bx-folder-open mr-2 align-middle text-xl"></i>
        {fileName}
      </label>
      {uploadEndpoint && (
        <button
          className="bg-gray-700/50 hover:bg-gray-700 p-4 rounded-lg whitespace-nowrap"
          id="uploadButton"
          type="submit"
        >
          <i className="bx bx-folder-up-arrow mr-2 align-middle text-xl"></i>
          Subir archivo
        </button>
      )}
    </form>
  );
}
