import type { SearchResult } from "./dtos";
import type { VectorDocument } from "./entities";
import type { EmbeddingResultDTO, EmbeddingCreationDTO } from "./dtos";

export interface EmbeddingAPI {
    generateEmbeddings(texts: EmbeddingCreationDTO[], collectionId: string): Promise<EmbeddingResultDTO>;
    getAllDocuments(collectionId: string): Promise<VectorDocument[]>;
    search(text: string, topK: number, collectionId: string): Promise<SearchResult[]>;
}