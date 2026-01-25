import { KnowledgeAsset } from "../aggregate/KnowledgeAsset";
import { KnowledgeAssetCouldNotBeSavedError } from "../errors/KnowledgeAssetCouldNotBeSavedError";
import { KnowledgeAssetNotFoundError } from "../errors/KnowledgeAssetNotFoundError";
import { NoKnowledgeAssetsCreatedError } from "../errors/NoKnowledgeAssetsCreatedError";
import { Result } from "@/modules/shared/@core-contracts/result";

export interface KnowledgeAssetsRepository {
  saveKnowledgeAsset(
    knowledgeAsset: KnowledgeAsset
  ): Promise<Result<KnowledgeAssetCouldNotBeSavedError, void>>;
  getAllKnowledgeAssets(): Promise<
    Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>
  >;
  getKnowledgeAssetById(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>>;
  deleteKnowledgeAsset(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, boolean>>;
}
