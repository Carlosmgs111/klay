import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import type { KnowledgeAssetDTO } from "../../@core-contracts/dtos";
import type { KnowledgeAsset } from "../../@core-contracts/entities";
import { Result } from "@/backend/klay+/shared/domain/Result";
import { KnowledgeAssetCouldNotBeSavedError } from "../../domain/errors/KnowledgeAssetCouldNotBeSavedError";
import { KnowledgeAssetNotFoundError } from "../../domain/errors/KnowledgeAssetNotFoundError";
import { NoKnowledgeAssetsCreatedError } from "../../domain/errors/NoKnowledgeAssetsCreatedError";


interface IDBKnowledgeConfig {
  dbName: string;
  version: number;
  storeName: string;
}

export class IDBRepository implements KnowledgeAssetsRepository {
  private config: IDBKnowledgeConfig;

  constructor(config?: Partial<IDBKnowledgeConfig>) {
    this.config = {
      dbName: config?.dbName || "knowledge-assets-db",
      version: config?.version || 1,
      storeName: config?.storeName || "knowledge-assets",
    };
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB not supported"));
        return;
      }

      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: "id" });
          // Create indexes for efficient querying
          store.createIndex("filesIds", "filesIds", { unique: false });
          store.createIndex("textsIds", "textsIds", { unique: false });
          store.createIndex("embeddingsCollectionsIds", "embeddingsCollectionsIds", { unique: false });
        }
      };
    });
  }

  async saveKnowledgeAsset(knowledgeAsset: KnowledgeAssetDTO): Promise<Result<KnowledgeAssetCouldNotBeSavedError, void>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.put(knowledgeAsset);

      request.onerror = () => reject(Result.fail(new KnowledgeAssetCouldNotBeSavedError(knowledgeAsset.id)));
      request.onsuccess = () => resolve(Result.ok(undefined));
    });
  }

  async getAllKnowledgeAssets(): Promise<Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(Result.fail(new NoKnowledgeAssetsCreatedError()));
      request.onsuccess = () => resolve(Result.ok(request.result));
    });
  }

  async getKnowledgeAssetById(id: string): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(id);

      request.onerror = () => reject(Result.fail(new KnowledgeAssetNotFoundError(id)));
      request.onsuccess = () => {
        if (request.result) {
          resolve(Result.ok(request.result));
        } else {
          reject(Result.fail(new KnowledgeAssetNotFoundError(id)));
        }
      };
    });
  }

  async deleteKnowledgeAsset(id: string): Promise<Result<KnowledgeAssetNotFoundError, boolean>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(id);
      console.log(request);
      request.onerror = () => reject(Result.fail(new KnowledgeAssetNotFoundError(id)));
      request.onsuccess = () => resolve(Result.ok(true));
    });
  }

  // Additional helper methods for browser-specific functionality
  
  async getKnowledgeAssetsBySourceId(sourceId: string): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAssetDTO[]>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("sourceId");
      const request = index.getAll(sourceId);

      request.onerror = () => reject(Result.fail(new KnowledgeAssetNotFoundError(sourceId)));
      request.onsuccess = () => resolve(Result.ok(request.result));
    });
  }

  async getKnowledgeAssetsByTextId(cleanedTextId: string): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAssetDTO[]>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("cleanedTextId");
      const request = index.getAll(cleanedTextId);

      request.onerror = () => reject(Result.fail(new KnowledgeAssetNotFoundError(cleanedTextId)));
      request.onsuccess = () => resolve(Result.ok(request.result));
    });
  }

  async countKnowledgeAssets(): Promise<Result<NoKnowledgeAssetsCreatedError, number>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.count();

      request.onerror = () => reject(Result.fail(new NoKnowledgeAssetsCreatedError()));
      request.onsuccess = () => resolve(Result.ok(request.result));
    });
  }

  async clearAllKnowledgeAssets(): Promise<Result<NoKnowledgeAssetsCreatedError, void>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onerror = () => reject(Result.fail(new NoKnowledgeAssetsCreatedError()));
      request.onsuccess = () => resolve(Result.ok(undefined));
    });
  }
}