import type { EmbeddingProvider } from "../@core-contracts/providers";
import type { VectorRepository } from "../@core-contracts/repositories";
import type { SearchResult } from "../@core-contracts/dtos";
import type { VectorDocument } from "../@core-contracts/entities";
import type { EmbeddingResultDTO, EmbeddingCreationDTO } from "../@core-contracts/dtos";

export class EmbeddingUseCases {
  constructor(
    private embeddingProvider: EmbeddingProvider,
    private vectorRepository: VectorRepository
  ) {}

  async generateEmbeddings({texts, collectionId, embeddingsId}: {texts: EmbeddingCreationDTO[], collectionId: string, embeddingsId: string}): Promise<EmbeddingResultDTO> {
    try {
    const embeddings = await this.embeddingProvider.generateEmbeddings(texts.map((text) => text.content));
    console.log("EmbeddingUseCases.generateEmbeddings - collectionId:", collectionId);
    const documents: VectorDocument[] = texts.map((text, index) => ({
      id: crypto.randomUUID(),
      content: text.content,
      embedding: embeddings[index],
      metadata: {
        sourceId: text.metadata.sourceId,
      },
      timestamp: Date.now(),
    }));
    await this.vectorRepository.addDocuments(documents, collectionId);
    return {
      documents,
      status: "success",
    };}
    catch (error: any) {
      console.log(error);
      return {
        documents: [],
        status: "error",
        message: error.message,
      };
    }
  }
  async search(text: string, topK: number, collectionId: string): Promise<SearchResult[]> {
    console.log("EmbeddingUseCases.search - text:", text);
    console.log("EmbeddingUseCases.search - topK:", topK);
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(text);
    console.log("EmbeddingUseCases.search - queryEmbedding:", queryEmbedding);
    const results = await this.vectorRepository.search(queryEmbedding, topK, collectionId);
    console.log("EmbeddingUseCases.search - results:", results);
    return results;
  }
  async getAllDocuments(collectionId: string): Promise<VectorDocument[]> {
    return this.vectorRepository.getAllDocuments(collectionId);
  }
}
