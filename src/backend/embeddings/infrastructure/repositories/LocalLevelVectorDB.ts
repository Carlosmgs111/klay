/*
 ? This was generated with Claude
 */

import type { VectorRepository } from "../../@core-contracts/repositories";
import { getEmbeddingsDB } from "../../../shared/config/repositories";

import { Level } from "level";
import type { VectorDocument } from "../../@core-contracts/entities";
import type { SearchResult, VectorDBConfig } from "../../@core-contracts/dtos";

export class LevelVectorStore implements VectorRepository {
  private db: Level<string, string>;
  private dimensions: number;
  private similarityThreshold: number;

  constructor(config: VectorDBConfig) {
    this.db = getEmbeddingsDB();
    this.dimensions = config.dimensions;
    this.similarityThreshold = config.similarityThreshold || 0.7;
    import("ai")
      .then((ai) => {
        this.cosineSimilarity = ai.cosineSimilarity;
      })
      .catch((error) => console.error(error));

    console.log(this.cosineSimilarity);
  }

  async initialize(): Promise<void> {
    await this.db.open();
  }

  async addDocument(
    document: Omit<VectorDocument, "timestamp">
  ): Promise<void> {
    if (document.embedding.length !== this.dimensions) {
      throw new Error(
        `Embedding dimension mismatch. Expected ${this.dimensions}, got ${document.embedding.length}`
      );
    }

    const vectorDoc: VectorDocument = {
      ...document,
      timestamp: Date.now(),
    };

    await this.db.put(document.id, JSON.stringify(vectorDoc));
  }

  async addDocuments(
    documents: Omit<VectorDocument, "timestamp">[]
  ): Promise<void> {
    const batch = this.db.batch();

    for (const doc of documents) {
      console.log(doc.embedding.length, this.dimensions);
      if (doc.embedding.length !== this.dimensions) {
        throw new Error(`Document ${doc.id}: Embedding dimension mismatch`);
      }

      const vectorDoc: VectorDocument = {
        ...doc,
        timestamp: Date.now(),
      };

      batch.put(doc.id, JSON.stringify(vectorDoc));
    }

    await batch.write();
  }

  async getDocument(id: string): Promise<VectorDocument | null> {
    try {
      const data = await this.db.get(id);
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === "LEVEL_NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    await this.db.del(id);
  }

  async search(
    queryEmbedding: number[],
    topK: number = 5
  ): Promise<SearchResult[]> {
    if (queryEmbedding.length !== this.dimensions) {
      throw new Error(
        `Query embedding dimension mismatch. Expected ${this.dimensions}`
      );
    }

    const results: SearchResult[] = [];

    for await (const value of this.db.values()) {
      const document: VectorDocument = JSON.parse(value);
      const similarity = this.cosineSimilarity(
        queryEmbedding,
        document.embedding
      );
      console.log({ similarity });
      if (similarity >= this.similarityThreshold) {
        results.push({ document, similarity });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  async getAllDocuments(): Promise<VectorDocument[]> {
    const documents: VectorDocument[] = [];

    for await (const value of this.db.values()) {
      documents.push(JSON.parse(value));
    }

    return documents;
  }

  async count(): Promise<number> {
    let count = 0;
    for await (const _ of this.db.keys()) {
      count++;
    }
    return count;
  }

  async clear(): Promise<void> {
    await this.db.clear();
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
