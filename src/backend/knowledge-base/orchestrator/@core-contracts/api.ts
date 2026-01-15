import type {
  KnowledgeAssetDTO,
  NewKnowledgeDTO,
} from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { KnowledgeAsset } from "@/modules/knowledge-base/knowledge-asset";

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
  getAllKnowledgeAssets(): Promise<KnowledgeAsset[]>;
  deleteKnowledgeAsset(id: string): Promise<boolean>;
  retrieveKnowledge(knowledgeAssetId: string, query: string): Promise<string[]>;
}
