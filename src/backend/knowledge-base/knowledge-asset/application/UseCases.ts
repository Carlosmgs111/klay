import type { KnowledgeAssetApi } from "../@core-contracts/api";
import type { NewKnowledgeDTO, KnowledgeAssetDTO } from "../@core-contracts/dtos";
import type { KnowledgeAssetsRepository } from "../@core-contracts/repositories";

export class KnowledgeAssetUseCases implements KnowledgeAssetApi {
  constructor(private repository: KnowledgeAssetsRepository) {}

  async generateKnowledgeAsset(dto: NewKnowledgeDTO): Promise<KnowledgeAssetDTO> {
    // Create a new knowledge asset
    const knowledgeAsset: KnowledgeAssetDTO = {
      id: crypto.randomUUID(),
      sourceId: typeof dto.source === "string" ? dto.source : dto.source.id,
      cleanedTextId: dto.cleanedTextId,
      embeddingsIds: dto.embeddingsIds,
    };

    await this.repository.saveKnowledgeAsset(knowledgeAsset);
    return knowledgeAsset;
  }

  async getAllKnowledgeAssets(): Promise<KnowledgeAssetDTO[]> {
    return this.repository.getAllKnowledgeAssets();
  }

  async getKnowledgeAssetById(id: string): Promise<KnowledgeAssetDTO> {
    return this.repository.getKnowledgeAssetById(id);
  }

  async deleteKnowledgeAsset(id: string): Promise<void> {
    return this.repository.deleteKnowledgeAsset(id);
  }
}
