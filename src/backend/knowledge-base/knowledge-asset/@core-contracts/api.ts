import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type {
  NewKnowledgeDTO,
  KnowledgeAssetDTO,
  FlowState,
  FullKnowledgeAssetDTO,
} from "./dtos";
import type { KnowledgeAsset } from "./entities";
import type { Result } from "@/modules/shared/@core-contracts/result";
import { KnowledgeAssetNotFoundError } from "../domain/errors/KnowledgeAssetNotFoundError";
import { NoKnowledgeAssetsCreatedError } from "../domain/errors/NoKnowledgeAssetsCreatedError";
import { KnowledgeAssetCouldNotBeSavedError } from "../domain/errors/KnowledgeAssetCouldNotBeSavedError";

export interface KnowledgeAssetApi {
  generateKnowledgeAsset(
    dto: NewKnowledgeDTO
  ): Promise<Result<KnowledgeAssetCouldNotBeSavedError, KnowledgeAssetDTO>>;
  generateKnowledgeAssetStreamingState(
    dto: NewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState>;
  addSourceToKnowledgeAsset(
    knowledgeAssetId: string,
    source: FileUploadDTO
  ): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>>;
  getFullKnowledgeAssetById(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, FullKnowledgeAssetDTO>>;
  getAllKnowledgeAssets(): Promise<
    Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>
  >;
  getKnowledgeAssetById(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>>;
  deleteKnowledgeAsset(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, boolean>>;
  retrieveKnowledge(
    knowledgeAssetId: string,
    query: string
  ): Promise<Result<KnowledgeAssetNotFoundError, string[]>>;
}
