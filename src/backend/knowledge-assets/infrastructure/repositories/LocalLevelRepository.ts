import type { KnowledgeAssetDTO } from "../../@core-contracts/dtos";
import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import { getKnowledgeAssetsDB } from "@/modules/shared/config/repositories";
// import { Level } from "level";

export class LocalLevelRepository implements KnowledgeAssetsRepository {
  private db: any;
  private dbInitialized: boolean = false;

  constructor() {
    console.log("LocalLevelRepository constructor");
  }

  private async ensureDB() {
    if (!this.dbInitialized) {
      this.db = await getKnowledgeAssetsDB();
      this.dbInitialized = true;
    }
  }

  async saveKnowledgeAsset(knowledgeAsset: KnowledgeAssetDTO): Promise<void> {
    await this.ensureDB();
    return this.db.put(knowledgeAsset.id, JSON.stringify(knowledgeAsset));
  }
  async getAllKnowledgeAssets(): Promise<KnowledgeAssetDTO[]> {
    try {
      await this.ensureDB();
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
  async getKnowledgeAssetById(id: string): Promise<KnowledgeAssetDTO> {
    await this.ensureDB();
    return this.db.get(id).then((data: any) => JSON.parse(data));
  }
  async deleteKnowledgeAsset(id: string): Promise<void> {
    await this.ensureDB();
    return this.db.del(id);
  }
}
