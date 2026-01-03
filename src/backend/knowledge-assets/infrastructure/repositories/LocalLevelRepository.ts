import type { KnowledgeAssetDTO } from "../../@core-contracts/dtos";
import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import { getKnowledgeAssetsDB } from "@/modules/shared/config/repositories";
import { Level } from "level";

export class LocalLevelRepository implements KnowledgeAssetsRepository {
  private db: Level;
  constructor() {
    console.log("LocalLevelRepository constructor");
    this.db = getKnowledgeAssetsDB();
  }
  saveKnowledgeAsset(knowledgeAsset: KnowledgeAssetDTO): Promise<void> {
    return this.db.put(knowledgeAsset.id, JSON.stringify(knowledgeAsset));
  }
  async getAllKnowledgeAssets(): Promise<KnowledgeAssetDTO[]> {
    try {
      const knowledgeAssets = [];
      for await (const value of this.db.values()) {
        knowledgeAssets.push(JSON.parse(value));
      }
      return knowledgeAssets;
    } catch (error) {
      console.log({ error });
      return [];
    }
  }
  getKnowledgeAssetById(id: string): Promise<KnowledgeAssetDTO> {
    return this.db.get(id).then((data) => JSON.parse(data));
  }
  deleteKnowledgeAsset(id: string): Promise<void> {
    return this.db.del(id);
  }
}
