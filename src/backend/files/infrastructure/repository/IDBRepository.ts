import type { Repository } from "../../@core-contracts/repositories";
import type { File } from "../../@core-contracts/entities";

interface IDBFilesConfig {
  dbName: string;
  version: number;
}

export class IDBRepository implements Repository {
  private config: IDBFilesConfig;
  private currentVersion?: number;

  constructor(config?: Partial<IDBFilesConfig>) {
    this.config = {
      dbName: config?.dbName || "files-repository-db",
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
            const store = db.createObjectStore(collectionId, { keyPath: "id" });
            store.createIndex("name", "name", { unique: false });
            store.createIndex("type", "type", { unique: false });
            store.createIndex("lastModified", "lastModified", { unique: false });
          }
        }
      };
    });
  }

  // private getStoreName(collectionId: string): string {
  //   return `${this.config.storeName}_${collectionId}`;
  // }

  async saveFile(collectionId: string, file: File): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);
      const request = store.put(file);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getFileById(collectionId: string, id: string): Promise<File | undefined> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        resolve(undefined);
        return;
      }

      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || undefined);
    });
  }

  async getFiles(collectionId: string): Promise<File[]> {
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
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteFile(collectionId: string, id: string): Promise<boolean> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(collectionId)) {
        resolve(true);
        return;
      }

      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);

      const getRequest = store.get(id);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          resolve(true);
          return;
        }
        const deleteRequest = store.delete(id);

        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onsuccess = () => resolve(true);
      };
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
      const storeNames = Array.from(db.objectStoreNames);
      const filesToClear = storeNames.filter(name => name.startsWith(`${this.config.dbName}_`));

      if (filesToClear.length === 0) {
        resolve();
        return;
      }

      const transaction = db.transaction(filesToClear, "readwrite");
      let clearedCount = 0;

      filesToClear.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          clearedCount++;
          if (clearedCount === filesToClear.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

}