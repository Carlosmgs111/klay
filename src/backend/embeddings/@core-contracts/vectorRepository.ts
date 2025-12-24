// src/lib/vectordb/types.ts

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: number;
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

export interface VectorDBConfig {
  dbPath: string;
  dimensions: number;
  similarityThreshold?: number;
}
export interface VectorRepository {
  initialize(): Promise<void>;
  addDocument(document: Omit<VectorDocument, "timestamp">): Promise<void>;
  addDocuments(documents: Omit<VectorDocument, "timestamp">[]): Promise<void>;
  getDocument(id: string): Promise<VectorDocument | null>;
  deleteDocument(id: string): Promise<void>;
  search(queryEmbedding: number[], topK: number): Promise<SearchResult[]>;
  getAllDocuments(): Promise<VectorDocument[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
  close(): Promise<void>;
}
