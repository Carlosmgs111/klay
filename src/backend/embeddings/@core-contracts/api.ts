import type { SearchResult } from "./vectorRepository";
import type { VectorDocument } from "./vectorRepository";

export interface EmbeddingAPI {
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    getAllDocuments(): Promise<VectorDocument[]>;
    search(text: string, topK?: number): Promise<SearchResult[]>;
}