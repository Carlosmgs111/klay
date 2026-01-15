import type { NewKnowledgeDTO, KnowledgeAssetDTO, FlowState } from "./dtos";
import type { KnowledgeAsset } from "./entities";

export interface KnowledgeAssetApi {
  generateKnowledgeAsset(dto: NewKnowledgeDTO): Promise<KnowledgeAssetDTO>;
  generateKnowledgeAssetStreamingState(dto: NewKnowledgeDTO): AsyncGenerator<KnowledgeAssetDTO | FlowState>;
  getAllKnowledgeAssets(): Promise<KnowledgeAsset[]>;
  getKnowledgeAssetById(id: string): Promise<KnowledgeAsset>;
  deleteKnowledgeAsset(id: string): Promise<boolean>;
  retrieveKnowledge(knowledgeAssetId: string, query: string): Promise<string[]>;
}
