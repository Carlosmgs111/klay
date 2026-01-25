import type {
  FullKnowledgeAssetDTO,
  KnowledgeAssetDTO,
  NewKnowledgeDTO,
} from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { KnowledgeAsset } from "@/modules/knowledge-base/knowledge-asset";
import type { Result } from "@/modules/shared/@core-contracts/result";
import type { KnowledgeAssetCouldNotBeSavedError } from "@/modules/knowledge-base/knowledge-asset/domain/errors/KnowledgeAssetCouldNotBeSavedError";
import type { KnowledgeAssetNotFoundError } from "@/modules/knowledge-base/knowledge-asset/domain/errors/KnowledgeAssetNotFoundError";
import type { NoKnowledgeAssetsCreatedError } from "@/modules/knowledge-base/knowledge-asset/domain/errors/NoKnowledgeAssetsCreatedError";

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
  generateNewKnowledge(document: NewKnowledgeDTO): Promise<Result<KnowledgeAssetCouldNotBeSavedError, KnowledgeAssetDTO>>;
  generateNewKnowledgeStreamingState(
    sourceDocument: NewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState>;
  getAllKnowledgeAssets(): Promise<Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>>;
  getFullKnowledgeAssetById(id: string): Promise<Result<KnowledgeAssetNotFoundError, FullKnowledgeAssetDTO>>;
  deleteKnowledgeAsset(id: string): Promise<Result<KnowledgeAssetNotFoundError, boolean>>;
  retrieveKnowledge(knowledgeAssetId: string, query: string): Promise<Result<KnowledgeAssetNotFoundError, string[]>>;
}
