import { useState, useEffect } from "react";
import { fileStore } from "../../../file-management/stores/files";

export interface StepInfo {
  id: string;
  title: string;
  success: boolean;
  error: boolean;
  visible: boolean;
}

const initialSteps: StepInfo[] = [
  { id: "file-upload", title: "File Upload", success: false, error: false, visible: false },
  { id: "text-extraction", title: "Text Extraction", success: false, error: false, visible: false },
  { id: "chunking", title: "Chunking", success: false, error: false, visible: false },
  { id: "embedding", title: "Embedding", success: false, error: false, visible: false },
  { id: "knowledge-asset", title: "Knowledge Asset", success: false, error: false, visible: false },
];

export function useKnowledgeManagement() {
  const [steps, setSteps] = useState<StepInfo[]>(initialSteps);
  const [processing, setProcessing] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [hasError, setHasError] = useState(false);

  const updateStepState = (stepId: string, success: boolean, error: boolean) => {
    setSteps(prev => {
      const stepIndex = prev.findIndex(s => s.id === stepId);

      return prev.map((step, index) => {
        if (step.id === stepId) {
          // Update current step
          return { ...step, success, error, visible: true };
        } else if (index === stepIndex + 1 && success && !error) {
          // If current step is success and no error, make next step visible and loading
          return { ...step, success: false, error: false, visible: true };
        }
        return step;
      });
    });
  };

  const handleFromFetching = async (id: string, formData: FormData) => {
    try {
      const response = await fetch("/api/knowledge/" + id, {
        method: "POST",
        body: formData,
      });

      if (!response.body) {
        console.error("No response body");
        setProcessing(false);
        setHasError(true);
        return;
      }

      if (!response.ok) {
        console.error("Response not ok");
        setProcessing(false);
        setHasError(true);
        return;
      }

      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      for (let run = true; run; ) {
        const { done, value } = await reader.read();
        run = !done;
        const data = decoder.decode(value, { stream: true });

        if (data) {
          try {
            const { status, step, message } = JSON.parse(data);
            const isSuccess = status === "SUCCESS";
            const isError = status === "ERROR";

            updateStepState(step, isSuccess, isError);
            if (isError) {
              setHasError(true);
              setProcessing(false);
              reader.releaseLock();
              return;
            }
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
      setHasError(true);
    }
  }

  const handleFromApi = async () => {
    const { knowledgeAssetsApiFactory } = await import("@/modules/knowledge-assets");
    try {
      const knowledgeAssetsApi = await knowledgeAssetsApiFactory({
      repository: "browser",
      filesPolicy: {
        storage: "browser",
        repository: "browser",
      },
      textExtractionPolicy: {
        extractor: "pdf",
        repository: "browser",
      },
      chunkingPolicy: {
        strategy: "fixed",
      },
      embeddingsPolicy: {
        provider: "hugging-face",
        repository: "browser",
      },
    });
    } catch (error) {
      console.error("Error processing:", error);
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        visible: index === 0,
        success: false,
        error: false
      })));
      setProcessing(false);
      setHasError(true);
    }
  }

  const handleProcess = async () => {
    const files = fileStore.get();
    const stagedFile = files.stagedIndexes[0];
    const file = files.files[stagedFile] as File;

    if (!file) {
      alert("Por favor selecciona un archivo primero");
      return;
    }

    setProcessing(true);
    setHasError(false);

    // Reset all steps and show only first step in loading state
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      visible: index === 0,
      success: false,
      error: false
    })));

    const id = crypto.randomUUID();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);
    formData.append("chunkingStrategy", "sentence");
    formData.append("embeddingStrategy", "sentence");

    // await handleFromFetching(id, formData);
    await handleFromApi();
  };

  useEffect(() => {
    const unsubscribe = fileStore.subscribe((files) => {
      const file = files.files[files.stagedIndexes[0]];
      setHasFile(Boolean(file && file instanceof File));
    });

    return unsubscribe;
  }, []);

  return {
    steps,
    processing,
    hasFile,
    hasError,
    handleProcess,
  };
}
