import type { SearchResult } from "./dtos";
import type { VectorDocument } from "./entities";
import type { EmbeddingResultDTO, EmbeddingCreationDTO } from "./dtos";

export interface EmbeddingAPI {
  generateEmbeddings({
    texts,
    collectionId,
  }: {
    texts: EmbeddingCreationDTO[];
    collectionId: string;
  }): Promise<EmbeddingResultDTO>;
  getAllDocuments({
    collectionId,
  }: {
    collectionId: string;
  }): Promise<VectorDocument[]>;
  search({
    text,
    topK,
    collectionId,
  }: {
    text: string;
    topK: number;
    collectionId: string;
  }): Promise<SearchResult[]>;
}
