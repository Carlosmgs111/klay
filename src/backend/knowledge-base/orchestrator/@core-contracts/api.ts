import type { GenerateNewKnowledgeDTO } from "./dtos";
import type {
  KnowledgeAssetDTO,
  NewKnowledgeDTO,
} from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";

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
  generateNewKnowledge(document: NewKnowledgeDTO): Promise<KnowledgeAssetDTO>;
  generateNewKnowledgeStreamingState(
    sourceDocument: NewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState>;
  deleteKnowledgeAsset(id: string): Promise<void>;
  retrieveKnowledge(knowledgeAssetId: string, query: string): Promise<string[]>;
}
