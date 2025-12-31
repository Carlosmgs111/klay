import LoadedFileSelector from "../../../file-management/components/LoadedFileSelector";
import Spinner from "@/shared/components/Spinner";
import FlowStep from "../../../../shared/components/FlowStep";
import { useKnowledgeManagement } from "./useKnowledgeManagement";

export default function KnowledgeManagement() {
  const { steps, processing, hasFile, hasError, handleProcess } = useKnowledgeManagement();

  return (
    <div className="flex flex-col gap-4 text-white">
      <h1>Knowledge Management</h1>
      <ul>
        <li>Subir archivo</li>
        <li>Extraer texto</li>
        <li>Limpiar texto</li>
        <li>Trocear texto</li>
        <li>Generar embeddings</li>
      </ul>
      <div className="border border-gray-500 p-2 rounded-xl">
        <LoadedFileSelector />
        <div id="flow" className="flex flex-col gap-2 mt-2">
          {steps.map((step) => (
            <FlowStep
              key={step.id}
              className="flow-step"
              id={step.id}
              title={step.title}
            >
              <Spinner
                id={step.id}
                className="flow-step-spinner"
                size="sm"
                hidden={!step.visible}
                success={step.success}
                error={step.error}
              />
            </FlowStep>
          ))}
        </div>
        <button
          id="process-button"
          className={`flex items-center w-full justify-center gap-2 p-2 rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            hasError
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleProcess}
          disabled={processing || !hasFile}
        >
          <i className={hasError ? "bx bx-error" : "bx bx-filter"}></i>
          {hasError ? "Error - Reintentar" : processing ? "Processing..." : "Process"}
        </button>
      </div>
    </div>
  );
}
