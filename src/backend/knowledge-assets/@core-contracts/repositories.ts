import type { KnowledgeAssetDTO } from "./dtos";

export interface KnowledgeAssetsRepository {
  saveKnowledgeAsset(knowledgeAsset: KnowledgeAssetDTO): Promise<void>;
  getAllKnowledgeAssets(): Promise<KnowledgeAssetDTO[]>;
  getKnowledgeAssetById(id: string): Promise<KnowledgeAssetDTO>;
  deleteKnowledgeAsset(id: string): Promise<void>;
}
