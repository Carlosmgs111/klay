import type { Repository } from "../../@core-contracts/repositories";
import type { Text } from "../../@core-contracts/entities";

interface IDBConfig {
  dbName: string;
  version: number;
}

export class IDBRepository implements Repository {
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

  private async openDB(collectionId?: string): Promise<IDBDatabase> {
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
        // If collectionId provided and store doesn't exist, trigger upgrade
        if (collectionId) {
          if (!db.objectStoreNames.contains(collectionId)) {
            this.currentVersion = version + 1;
            db.close();
            this.openDB(collectionId).then(resolve).catch(reject);
            return;
          }
        }
        resolve(db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        // Create collection store if collectionId provided
        if (collectionId) {
          if (!db.objectStoreNames.contains(collectionId)) {
            db.createObjectStore(collectionId, { keyPath: "id" });
          }
        }
      };
    });
  }

  async saveTextById(collectionId: string, index: string, text: Text): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);
      const request = store.put({ ...text, id: index });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTextById(collectionId: string, index: string): Promise<Text> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        reject(new Error(`Collection ${collectionId} not found`));
        return;
      }

      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
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

  async getAllTexts(collectionId: string): Promise<Text[]> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        resolve([]);
        return;
      }

      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const texts = request.result.map((item: any) => {
          return item;
        });
        resolve(texts);
      };
    });
  }

  async getAllIndexes(collectionId: string): Promise<string[]> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        resolve([]);
        return;
      }

      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
      const request = store.getAllKeys();
      request.onerror = () => reject(request.error);
      request.onsuccess = (event: any) => {
        resolve(event.target.result as string[]);
      };
    });
  }

  async deleteTextById(collectionId: string, index: string): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        reject(new Error(`Collection ${collectionId} not found`));
        return;
      }

      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);
      const request = store.delete(index);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearCollection(collectionId: string): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        resolve();
        return;
      }

      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async purge(): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.dbName], "readwrite");
      const store = transaction.objectStore(this.config.dbName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
