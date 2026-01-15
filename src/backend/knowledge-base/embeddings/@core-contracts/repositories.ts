import type { SearchResult } from "./dtos";
import type { VectorDocument } from "./entities";

export interface VectorRepository {
  initialize(): Promise<void>;
  addDocument(document: Omit<VectorDocument, "timestamp">, collectionId: string): Promise<void>;
  addDocuments(documents: Omit<VectorDocument, "timestamp">[], collectionId: string): Promise<void>;
  getDocument(id: string, collectionId: string): Promise<VectorDocument | null>;
  deleteDocument(id: string, collectionId: string): Promise<void>;
  search(queryEmbedding: number[], topK: number, collectionId: string): Promise<SearchResult[]>;
  getAllDocuments(collectionId: string): Promise<VectorDocument[]>;
  count(collectionId: string): Promise<number>;
  clear(collectionId: string): Promise<void>;
  close(): Promise<void>;
}
