import type { EmbeddingProvider } from "../@core-contracts/providers";
import type { VectorRepository } from "../@core-contracts/vectorRepository";
import type { SearchResult } from "../@core-contracts/vectorRepository";
import type { VectorDocument } from "../@core-contracts/vectorRepository";

export class EmbeddingUseCases {
  constructor(
    private embeddingProvider: EmbeddingProvider,
    private vectorRepository: VectorRepository
  ) {}

  async generateEmbeddings(texts: string[]): Promise<VectorDocument[]> {
    const embeddings = await this.embeddingProvider.generateEmbeddings(texts);
    const documents = texts.map((text, index) => ({
      id: index.toString(),
      content: text,
      embedding: embeddings[index],
      metadata: {},
      timestamp: Date.now(),
    }));
    await this.vectorRepository.addDocuments(documents);
    return documents;
  }
  async search(text: string, topK: number): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(text);
    return this.vectorRepository.search(queryEmbedding, topK);
  }
  async getAllDocuments(): Promise<VectorDocument[]> {
    return this.vectorRepository.getAllDocuments();
  }
}
