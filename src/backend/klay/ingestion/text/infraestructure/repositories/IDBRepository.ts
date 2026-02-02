import type { TextRepository } from "../../domain/TextRepository";
import type { Text } from "../../domain/Text";

interface IDBConfig {
  dbName: string;
  version: number;
}

export class IDBRepository implements TextRepository {
  private config: IDBConfig;
  private currentVersion?: number;

  constructor(config?: Partial<IDBConfig>) {
    this.config = {
      dbName: config?.dbName || "text-extraction-db",
      version: config?.version || 1,
    };
  }

  private async getCurrentVersion(): Promise<number> {
    if (this.currentVersion !== undefined) {
      return this.currentVersion;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(this.config.dbName);
      request.onsuccess = () => {
        const db = request.result;
        this.currentVersion = db.version;
        db.close();
        resolve(this.currentVersion);
      };
      request.onerror = () => {
        this.currentVersion = this.config.version;
        resolve(this.config.version);
      };
    });
  }

  private async openDB(): Promise<IDBDatabase> {
    const version = await this.getCurrentVersion();

    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB not supported"));
        return;
      }

      const request = indexedDB.open(this.config.dbName, version);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const storeName = "texts";

        // If store doesn't exist, trigger upgrade
        if (!db.objectStoreNames.contains(storeName)) {
          this.currentVersion = version + 1;
          db.close();
          this.openDB().then(resolve).catch(reject);
          return;
        }
        resolve(db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        const storeName = "texts";

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      };
    });
  }

  async saveText(text: Text): Promise<void> {
    const db = await this.openDB();
    const storeName = "texts";

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(text);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTextById(id: string): Promise<Text> {
    const db = await this.openDB();
    const storeName = "texts";

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllTexts(): Promise<Text[]> {
    const db = await this.openDB();
    const storeName = "texts";

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteTextById(id: string): Promise<void> {
    const db = await this.openDB();
    const storeName = "texts";

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async purge(): Promise<void> {
    const db = await this.openDB();
    const storeName = "texts";

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
