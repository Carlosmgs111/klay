import type { SearchResult } from "./repositories";
import type { VectorDocument } from "./repositories";

export interface EmbeddingAPI {
    generateEmbeddings(texts: string[]): Promise<VectorDocument[]>;
    getAllDocuments(): Promise<VectorDocument[]>;
    search(text: string, topK?: number): Promise<SearchResult[]>;
}