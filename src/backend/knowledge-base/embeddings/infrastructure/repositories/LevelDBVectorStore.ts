/*
 ? This was generated with Claude
 */

import type { VectorRepository } from "../../@core-contracts/repositories";
import { getDB } from "../../../../klay+/shared/config/repositories";
import type { VectorDocument } from "../../@core-contracts/entities";
import type { SearchResult, VectorDBConfig } from "../../@core-contracts/dtos";

export class LevelDBVectorStore implements VectorRepository {
  private db: any;
  private dimensions: number;
  private similarityThreshold: number;
  private dbInitialized: boolean = false;

  constructor(config: VectorDBConfig) {
    this.dimensions = config.dimensions;
    this.similarityThreshold = config.similarityThreshold || 0.7;
    import("ai")
      .then((ai) => {
        this.cosineSimilarity = ai.cosineSimilarity;
      })
      .catch((error) => console.error(error));
  }

  async initialize(): Promise<void> {
    if (!this.dbInitialized) {
      this.db = await getDB("embeddings");
      this.dbInitialized = true;
      await this.db.open();
    }
  }

  /**
   * Ensures the database is initialized.
   * Collections in LevelDB are virtual - they're created automatically
   * when documents are added with a collection prefix.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.dbInitialized) {
      await this.initialize();
    }
  }

  async addDocument(
    document: Omit<VectorDocument, "timestamp">,
    collectionId: string,
  ): Promise<void> {
    await this.ensureInitialized();

    if (document.embedding.length !== this.dimensions) {
      throw new Error(
        `Embedding dimension mismatch. Expected ${this.dimensions}, got ${document.embedding.length}`
      );
    }

    const vectorDoc: VectorDocument = {
      ...document,
      timestamp: Date.now(),
    };

    // Use collectionId as key prefix for namespacing
    const key = `${collectionId}:${document.id}`;
    await this.db.put(key, JSON.stringify(vectorDoc));
  }

  async addDocuments(
    documents: Omit<VectorDocument, "timestamp">[],
    collectionId: string
  ): Promise<void> {
    await this.ensureInitialized();

    const batch = this.db.batch();

    for (const doc of documents) {
      if (doc.embedding.length !== this.dimensions) {
        throw new Error(`Document ${doc.id}: Embedding dimension mismatch`);
      }

      const vectorDoc: VectorDocument = {
        ...doc,
        timestamp: Date.now(),
      };

      // Use collectionId as key prefix for namespacing
      const key = `${collectionId}:${doc.id}`;
      batch.put(key, JSON.stringify(vectorDoc));
    }

    await batch.write();
  }

  async getDocument(id: string, collectionId: string): Promise<VectorDocument | null> {
    await this.ensureInitialized();

    try {
      const key = `${collectionId}:${id}`;
      const data = await this.db.get(key);
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === "LEVEL_NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async deleteDocument(id: string, collectionId: string): Promise<void> {
    await this.ensureInitialized();

    const key = `${collectionId}:${id}`;
    await this.db.del(key);
  }

  async search(
    queryEmbedding: number[],
    topK: number = 5,
    collectionId: string
  ): Promise<SearchResult[]> {
    await this.ensureInitialized();

    if (queryEmbedding.length !== this.dimensions) {
      throw new Error(
        `Query embedding dimension mismatch. Expected ${this.dimensions}`
      );
    }

    const results: SearchResult[] = [];
    const prefix = `${collectionId}:`;

    // Iterate only over keys with the specified collection prefix
    for await (const [key, value] of this.db.iterator()) {
      if (!key.startsWith(prefix)) {
        continue;
      }

      const document: VectorDocument = JSON.parse(value);
      const similarity = this.cosineSimilarity(
        queryEmbedding,
        document.embedding
      );
      if (similarity >= this.similarityThreshold) {
        results.push({ document, similarity });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  async getAllDocuments(collectionId: string): Promise<VectorDocument[]> {
    await this.ensureInitialized();

    const documents: VectorDocument[] = [];
    const prefix = `${collectionId}:`;

    // Iterate only over keys with the specified collection prefix
    for await (const [key, value] of this.db.iterator()) {
      if (!key.startsWith(prefix)) {
        continue;
      }
      documents.push(JSON.parse(value));
    }

    return documents;
  }

  async count(collectionId: string): Promise<number> {
    await this.ensureInitialized();

    let count = 0;
    const prefix = `${collectionId}:`;

    for await (const key of this.db.keys()) {
      if (key.startsWith(prefix)) {
        count++;
      }
    }
    return count;
  }

  async clear(collectionId: string): Promise<void> {
    await this.ensureInitialized();

    const batch = this.db.batch();
    const prefix = `${collectionId}:`;

    for await (const key of this.db.keys()) {
      if (key.startsWith(prefix)) {
        batch.del(key);
      }
    }

    await batch.write();
  }

  async close(): Promise<void> {
    await this.db.close();
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

    if (magnitude === 0) {
      return 0;
    }

    return dotProduct / magnitude;
  }
}
