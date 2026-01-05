import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import type { KnowledgeAssetDTO } from "../../@core-contracts/dtos";

interface BrowserKnowledgeConfig {
  dbName: string;
  version: number;
  storeName: string;
}

export class BrowserRepository implements KnowledgeAssetsRepository {
  private config: BrowserKnowledgeConfig;

  constructor(config?: Partial<BrowserKnowledgeConfig>) {
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
          store.createIndex("sourceId", "sourceId", { unique: false });
          store.createIndex("cleanedTextId", "cleanedTextId", { unique: false });
        }
      };
    });
  }

  async saveKnowledgeAsset(knowledgeAsset: KnowledgeAssetDTO): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.put(knowledgeAsset);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllKnowledgeAssets(): Promise<KnowledgeAssetDTO[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getKnowledgeAssetById(id: string): Promise<KnowledgeAssetDTO> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(new Error(`Knowledge asset with id ${id} not found`));
        }
      };
    });
  }

  async deleteKnowledgeAsset(id: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Additional helper methods for browser-specific functionality
  
  async getKnowledgeAssetsBySourceId(sourceId: string): Promise<KnowledgeAssetDTO[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("sourceId");
      const request = index.getAll(sourceId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getKnowledgeAssetsByTextId(cleanedTextId: string): Promise<KnowledgeAssetDTO[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("cleanedTextId");
      const request = index.getAll(cleanedTextId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async countKnowledgeAssets(): Promise<number> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearAllKnowledgeAssets(): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}