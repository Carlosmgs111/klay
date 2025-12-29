import type { VectorDocument } from "./entities";

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

export interface VectorDBConfig {
  dbPath: string;
  dimensions: number;
  similarityThreshold?: number;
}
