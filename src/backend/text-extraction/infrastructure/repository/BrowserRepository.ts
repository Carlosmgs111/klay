import type { Repository } from "../../@core-contracts/repositories";
import type { Text } from "../../@core-contracts/entities";

interface BrowserDBConfig {
  dbName: string;
  version: number;
  storeName: string;
}

export class BrowserRepository implements Repository {
  private config: BrowserDBConfig;

  constructor(config?: Partial<BrowserDBConfig>) {
    this.config = {
      dbName: config?.dbName || "text-extraction-db",
      version: config?.version || 1,
      storeName: config?.storeName || "texts",
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
          db.createObjectStore(this.config.storeName, { keyPath: "id" });
        }
      };
    });
  }

  async saveTextById(index: string, text: Text): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.put({ ...text, id: index });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTextById(index: string): Promise<Text> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(index);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          const { id, ...text } = request.result;
          resolve(text as Text);
        } else {
          reject(new Error(`Text with id ${index} not found`));
        }
      };
    });
  }

  async getAllTexts(): Promise<Text[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const texts = request.result.map((item: any) => {
          const { id, ...text } = item;
          return text as Text;
        });
        resolve(texts);
      };
    });
  }

  async getAllIndexes(): Promise<string[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }

  async deleteTextById(index: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(index);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async purge(): Promise<void> {
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