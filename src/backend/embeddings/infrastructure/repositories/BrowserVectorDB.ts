import type { VectorRepository } from "../../@core-contracts/repositories";
import type { VectorDocument } from "../../@core-contracts/entities";
import type { SearchResult } from "../../@core-contracts/dtos";

interface BrowserVectorConfig {
  dbName: string;
  version: number;
  storeName: string;
  dimensions: number;
  similarityThreshold: number;
}

export class BrowserVectorDB implements VectorRepository {
  private config: BrowserVectorConfig;

  constructor(config: Partial<BrowserVectorConfig> = {}) {
    this.config = {
      dbName: config.dbName || "vector-embeddings-db",
      version: config.version || 1,
      storeName: config.storeName || "embeddings",
      dimensions: config.dimensions || 1024,
      similarityThreshold: config.similarityThreshold || 0.7,
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
          store.createIndex("metadata", "metadata", { multiEntry: false });
          store.createIndex("timestamp", "timestamp");
        }
      };
    });
  }

  async initialize(): Promise<void> {
    // Initialize the database by opening it
    const db = await this.openDB();
    db.close();
  }

  async addDocument(document: Omit<VectorDocument, "timestamp">): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      
      const documentWithTimestamp: VectorDocument = {
        ...document,
        timestamp: Date.now(),
      };
      
      const request = store.put(documentWithTimestamp);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async addDocuments(documents: Omit<VectorDocument, "timestamp">[]): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      
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

  async getDocument(id: string): Promise<VectorDocument | null> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async search(queryEmbedding: number[], topK: number): Promise<SearchResult[]> {
    const allDocuments = await this.getAllDocuments();
    
    // Calculate cosine similarity for each document
    const results: SearchResult[] = allDocuments.map(doc => {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
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

  async getAllDocuments(): Promise<VectorDocument[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async count(): Promise<number> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async close(): Promise<void> {
    // Browser IndexedDB connections are automatically managed
    // No explicit close needed
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