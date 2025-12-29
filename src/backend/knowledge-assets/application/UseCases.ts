import type { GenerateNewKnowledgeDTO } from "../@core-contracts/dtos";
import type { FilesApi } from "@/backend/files/@core-contracts/api";
import type { TextExtractorApi } from "@/backend/text-extraction/@core-contracts/api";
import type { ChunkingApi } from "@/modules/chunking/@core-contracts/api";
import type { EmbeddingAPI } from "@/modules/embeddings/@core-contracts/api";
import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type { KnowledgeAssetsRepository } from "../@core-contracts/repositories";
import type { KnowledgeAssetDTO } from "../@core-contracts/dtos";

export class UseCases {
  constructor(
    private filesApi: FilesApi,
    private textExtractorApi: TextExtractorApi,
    private chunkingApi: ChunkingApi,
    private embeddingApi: EmbeddingAPI,
    private knowledgeAssetsRepository: KnowledgeAssetsRepository
  ) {}
  /**
   * This function generates a new knowledge asset from a file.
   * @param command The command to generate a new knowledge asset.
   * @returns A promise that resolves when the knowledge asset is generated.
   */
  async generateNewKnowledge(
    command: GenerateNewKnowledgeDTO
  ): Promise<KnowledgeAssetDTO> {
    const { source, chunkingStrategy, embeddingStrategy } = command;
    const sourceFile = source as FileUploadDTO;

    try {
      const file = await this.filesApi.uploadFile(sourceFile);

      const text = await this.textExtractorApi.extractTextFromPDF({
        id: sourceFile.id,
        source: sourceFile,
      });
      const chunks = await this.chunkingApi.chunkOne(text.text, {
        strategy: chunkingStrategy,
      });
      const chunksContent = chunks.chunks.map((chunk) => chunk.content);
      const embeddings = await this.embeddingApi.generateEmbeddings(
        chunksContent
      );
      const knowledgeAsset: KnowledgeAssetDTO = {
        id: crypto.randomUUID(),
        sourceId: sourceFile.id,
        cleanedTextId: text.id,
        chunksIds: chunks.chunks.map((chunk) => chunk.id),
        embeddingsIds: embeddings.map((embedding) => embedding.id),
      };
      // await this.knowledgeAssetsRepository.saveKnowledgeAsset(knowledgeAsset);
      return knowledgeAsset;
    } catch (error) {
      throw error;
    }
  }
  async retrieveKnowledge(command: string): Promise<void> {}
}
