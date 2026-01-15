import type { VectorRepository } from "../../@core-contracts/repositories";
import type { VectorDocument } from "../../@core-contracts/entities";
import type { SearchResult } from "../../@core-contracts/dtos";

interface IDBVectorConfig {
  dbName: string;
  version: number;
  dimensions: number;
  similarityThreshold: number;
}

export class IDBVectorStore implements VectorRepository {
  private config: IDBVectorConfig;
  private currentVersion: number | undefined;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(config: Partial<IDBVectorConfig> = {}) {
    this.config = {
      dbName: config.dbName || "vector-embeddings-db",
      version: config.version || 1,
      dimensions: config.dimensions || 1024,
      similarityThreshold: config.similarityThreshold || 0.5,
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
        this.currentVersion = 1;
        resolve(1);
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
        if (collectionId && !db.objectStoreNames.contains(collectionId)) {
          this.currentVersion = version + 1;
          this.openDB(collectionId).then(resolve).catch(reject);
          return;
        }
        resolve(db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        if (collectionId && !db.objectStoreNames.contains(collectionId)) {
          const store = db.createObjectStore(collectionId, { keyPath: "id" });
          store.createIndex("metadata", "metadata", { multiEntry: false });
          store.createIndex("timestamp", "timestamp");
        }
      };
    });
  }

  async initialize(): Promise<void> {
    const db = await this.openDB();
    db.close();
  }

  async addDocument(document: Omit<VectorDocument, "timestamp">, collectionId: string): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);

      const documentWithTimestamp: VectorDocument = {
        ...document,
        timestamp: Date.now(),
      };

      const request = store.put(documentWithTimestamp);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async addDocuments(documents: Omit<VectorDocument, "timestamp">[], collectionId: string): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);

      let completed = 0;
      let hasError = false;

      documents.forEach(doc => {
        if (hasError) return;

        const documentWithTimestamp: VectorDocument = {
          ...doc,
          timestamp: Date.now(),
        };

        const request = store.put(documentWithTimestamp);

        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };

        request.onsuccess = () => {
          completed++;
          if (completed === documents.length) {
            resolve();
          }
        };
      });

      if (documents.length === 0) {
        resolve();
      }
    });
  }

  async getDocument(id: string, collectionId: string): Promise<VectorDocument | null> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async deleteDocument(id: string, collectionId: string): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async search(queryEmbedding: number[], topK: number = 5, collectionId: string): Promise<SearchResult[]> {
    const allDocuments = await this.getAllDocuments(collectionId);
    console.log("IDBVectorStore.search - allDocuments:", allDocuments);
    // Calculate cosine similarity for each document
    const results: SearchResult[] = allDocuments.map(doc => {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      console.log("IDBVectorStore.search - similarity:", similarity);
      return {
        document: doc,
        similarity,
        distance: 1 - similarity,
      };
    });

    // Sort by similarity (highest first) and return top K
    return results
      .filter(result => result.similarity >= this.config.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  async getAllDocuments(collectionId: string): Promise<VectorDocument[]> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async count(collectionId: string): Promise<number> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readonly");
      const store = transaction.objectStore(collectionId);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clear(collectionId: string): Promise<void> {
    const db = await this.openDB(collectionId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collectionId], "readwrite");
      const store = transaction.objectStore(collectionId);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}