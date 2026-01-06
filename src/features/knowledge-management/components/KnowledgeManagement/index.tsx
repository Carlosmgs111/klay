import LoadedFileSelector from "../../../file-management/components/LoadedFileSelector";
import Spinner from "@/shared/components/Spinner";
import FlowStep from "../../../../shared/components/FlowStep";
import { useKnowledgeManagement } from "./useKnowledgeManagement";

export default function KnowledgeManagement() {
  const { steps, processing, hasFile, hasError, handleProcess } = useKnowledgeManagement();

  return (
    <div className="flex flex-col gap-4 text-white">
        <div className="bg-slate-700/50 border border-slate-800/50 h-20 w-full rounded-md">
          <LoadedFileSelector className="h-20 w-full px-8" />
        </div>
        <div id="flow" className="flex flex-col gap-2 mt-2">
          {steps.map((step) => (
            <FlowStep
              key={step.id}
              className="flow-step bg-slate-800/50 border border-slate-600/50"
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
  );
}
