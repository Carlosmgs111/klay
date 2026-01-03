import type { GenerateNewKnowledgeDTO } from "./dtos";
import type { KnowledgeAssetDTO } from "./dtos";

export interface FlowState {
  status: "SUCCESS" | "ERROR";
  step:
    | "file-upload"
    | "text-extraction"
    | "chunking"
    | "embedding"
    | "knowledge-asset";
  message?: string;
}

export interface KnowledgeAssetsAPI {
  generateNewKnowledge(
    document: GenerateNewKnowledgeDTO
  ): Promise<KnowledgeAssetDTO>;
  generateNewKnowledgeStreamingState(
    sourceDocument: GenerateNewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState>;
  retrieveKnowledge(document: string): Promise<void>;
}
