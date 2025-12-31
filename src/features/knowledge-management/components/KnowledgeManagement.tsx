import { useState, useEffect } from "react";
import { fileStore } from "../../file-management/stores/files";
import LoadedFileSelector from "../../file-management/components/LoadedFileSelector";
import Spinner from "@/shared/components/Spinner";
import FlowStep from "../../mindmap-management/components/FlowStep";

type StepState = "loading" | "success" | "error";

interface StepInfo {
  id: string;
  title: string;
  state: StepState;
  visible: boolean;
}

const initialSteps: StepInfo[] = [
  { id: "file-upload", title: "File Upload", state: "success", visible: true },
  { id: "text-extraction", title: "Text Extraction", state: "loading", visible: true },
  { id: "chunking", title: "Chunking", state: "loading", visible: false },
  { id: "embedding", title: "Embedding", state: "loading", visible: false },
  { id: "knowledge-asset", title: "Knowledge Asset", state: "loading", visible: false },
];

export default function KnowledgeManagement() {
  const [steps, setSteps] = useState<StepInfo[]>(initialSteps);
  const [processing, setProcessing] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const updateStepState = (stepId: string, state: StepState, visible: boolean = true) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, state, visible }
        : step
    ));
  };

  const handleProcess = async () => {
    const files = fileStore.get();
    const stagedFile = files.stagedIndexes[0];
    const file = files.files[stagedFile] as File;

    if (!file) {
      alert("Por favor selecciona un archivo primero");
      return;
    }

    setProcessing(true);

    // Reset steps except file-upload
    setSteps(prev => prev.map(step => ({
      ...step,
      visible: step.id === "file-upload",
      state: step.id === "file-upload" ? "success" : "loading"
    })));

    const id = crypto.randomUUID();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);
    formData.append("chunkingStrategy", "sentence");
    formData.append("embeddingStrategy", "sentence");

    try {
      const response = await fetch("/api/knowledge/" + id, {
        method: "POST",
        body: formData,
      });

      if (!response.body) {
        console.error("No response body");
        setProcessing(false);
        return;
      }

      if (!response.ok) {
        console.error("Response not ok");
        setProcessing(false);
        return;
      }

      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      for (let run = true; run; ) {
        const { done, value } = await reader.read();
        run = !done;
        const data = decoder.decode(value, { stream: true });

        if (data) {
          console.log("DATA", data);
          try {
            const { status, step, message } = JSON.parse(data);
            console.log(status, step, message);

            // Update the current step
            const stepState: StepState = status === "completed" ? "success" : "loading";
            updateStepState(step, stepState, true);
          } catch (e) {
            console.error("Error parsing data:", e);
          }
        }

        if (done) {
          reader.releaseLock();
          setProcessing(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error processing:", error);
      setProcessing(false);
    }
  };

  useEffect(() => {
    fileStore.subscribe((files) => {
      const file = files.files[files.stagedIndexes[0]];
      setHasFile(Boolean(file && file instanceof File));
    });
  }, []);

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
                state={step.state}
                hidden={!step.visible}
              />
            </FlowStep>
          ))}
        </div>
        <button
          id="process-button"
          className="flex items-center w-full justify-center gap-2 p-2 bg-blue-500 rounded-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          onClick={handleProcess}
          disabled={processing || !hasFile}
        >
          <i className="bx bx-filter"></i>
          {processing ? "Processing..." : "Process"}
        </button>
      </div>
    </div>
  );
}
