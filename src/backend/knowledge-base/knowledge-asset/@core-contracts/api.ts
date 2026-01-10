import type { NewKnowledgeDTO, KnowledgeAssetDTO } from "./dtos";

export interface KnowledgeAssetApi {
  generateKnowledgeAsset(dto: NewKnowledgeDTO): Promise<KnowledgeAssetDTO>;
  getAllKnowledgeAssets(): Promise<KnowledgeAssetDTO[]>;
  getKnowledgeAssetById(id: string): Promise<KnowledgeAssetDTO>;
  deleteKnowledgeAsset(id: string): Promise<void>;
}
