import type { SearchResult } from "./dtos";
import type { VectorDocument } from "./entities";

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
