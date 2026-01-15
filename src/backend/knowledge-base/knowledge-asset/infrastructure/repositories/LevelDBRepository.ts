import type { KnowledgeAsset } from "../../@core-contracts/entities";
import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import { getDB } from "@/modules/shared/config/repositories";
// import { Level } from "level";

export class LevelDBRepository implements KnowledgeAssetsRepository {
  private db: any;
  private dbInitialized: boolean = false;

  constructor() {
    console.log("LevelDBRepository constructor");
  }

  private async ensureDB() {
    if (!this.dbInitialized) {
      this.db = await getDB("knowledge-assets");
      this.dbInitialized = true;
    }
  }

  async saveKnowledgeAsset(knowledgeAsset: KnowledgeAsset): Promise<void> {
    await this.ensureDB();
    return this.db.put(knowledgeAsset.id, JSON.stringify(knowledgeAsset));
  }
  async getAllKnowledgeAssets(): Promise<KnowledgeAsset[]> {
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
  async getKnowledgeAssetById(id: string): Promise<KnowledgeAsset> {
    await this.ensureDB();
    return this.db.get(id).then((data: any) => JSON.parse(data));
  }
  async deleteKnowledgeAsset(id: string): Promise<boolean> {
    await this.ensureDB();
    return this.db.del(id).then(() => true).catch(() => false);
  }
}
