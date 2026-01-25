import Datastore from "nedb-promises";
import { Result } from "@/modules/shared/@core-contracts/result";
import { KnowledgeAsset } from "../../domain/aggregate/KnowledgeAsset";
import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import { KnowledgeAssetCouldNotBeSavedError } from "../../domain/errors/KnowledgeAssetCouldNotBeSavedError";
import { KnowledgeAssetNotFoundError } from "../../domain/errors/KnowledgeAssetNotFoundError";
import { NoKnowledgeAssetsCreatedError } from "../../domain/errors/NoKnowledgeAssetsCreatedError";
import path from "path";

export class NeDBRepository implements KnowledgeAssetsRepository {
  private db: Datastore<any>;

  constructor(dbPath?: string) {
    this.db = Datastore.create({
      filename:
        dbPath ||
        path.join(process.cwd(), "database", "nedb", "knowledge-assets.db"),
      autoload: true,
    });
    this.db.ensureIndex({ fieldName: "id", unique: true });
  }

  async saveKnowledgeAsset(
    knowledgeAsset: KnowledgeAsset
  ): Promise<Result<KnowledgeAssetCouldNotBeSavedError, void>> {
    const existing = await this.db.findOne({ id: knowledgeAsset.id });
    const data = {
      ...knowledgeAsset,
      createdAt: existing?.createdAt || knowledgeAsset.createdAt || new Date(),
      updatedAt: new Date(),
    };
    if (existing) {
      await this.db.update({ id: knowledgeAsset.id }, data);
    } else {
      await this.db.insert(data);
    }
    return Result.success(undefined);
  }

  async getAllKnowledgeAssets(): Promise<Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>> {
    const assets = await this.db.find({});
    if (assets.length === 0) {
      return Result.failure(new NoKnowledgeAssetsCreatedError());
    }
    
    return Result.success(assets.map(({ _id, ...asset }: any) => ({
      ...asset,
      metadata: asset.metadata || {},
      createdAt: new Date(asset.createdAt),
      updatedAt: new Date(asset.updatedAt),
    })));
  }

  async getKnowledgeAssetById(id: string): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>> {
    const asset = await this.db.findOne({ id });
    if (!asset) {
      return Result.failure(new KnowledgeAssetNotFoundError(id));
    }

    const { _id, ...data } = asset;
    return Result.success({
      ...data,
      metadata: data.metadata || {},
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  async deleteKnowledgeAsset(id: string): Promise<Result<KnowledgeAssetNotFoundError, boolean>> {
    const numRemoved = await this.db.remove({ id }, {});
    if (numRemoved === 0) {
      return Result.failure(new KnowledgeAssetNotFoundError(id));
    }
    return Result.success(true);
  }
}
