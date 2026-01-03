import type { GenerateNewKnowledgeDTO } from "../@core-contracts/dtos";
import type { FilesApi } from "@/backend/files/@core-contracts/api";
import type { TextExtractorApi } from "@/backend/text-extraction/@core-contracts/api";
import type { ChunkingApi } from "@/modules/chunking/@core-contracts/api";
import type { EmbeddingAPI } from "@/modules/embeddings/@core-contracts/api";
import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type { KnowledgeAssetsRepository } from "../@core-contracts/repositories";
import type { KnowledgeAssetDTO } from "../@core-contracts/dtos";
import type { FlowState } from "../@core-contracts/api";
import type { Chunk } from "@/backend/chunking/@core-contracts/entities";
import type { VectorDocument } from "@/backend/embeddings/@core-contracts/entities";

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
      const { status, message } = await this.filesApi.uploadFile(sourceFile);
      console.log(status, message);
      if (status === "ERROR") {
        throw new Error(message);
      }

      const text = await this.textExtractorApi.extractTextFromPDF({
        id: sourceFile.id,
        source: sourceFile,
      });
      if (text.status === "error") {
        throw new Error(text.message);
      }
      const chunks = await this.chunkingApi.chunkOne(text.text as string, {
        strategy: chunkingStrategy,
      });
      const chunkBatch = chunks.chunks as Chunk[];
      const chunksContent = chunkBatch?.map((chunk) => chunk.content);
      const embeddings = await this.embeddingApi.generateEmbeddings(
        chunksContent
      );
      const embeddingsDocuments = embeddings.documents as VectorDocument[];
      const knowledgeAsset: KnowledgeAssetDTO = {
        id: crypto.randomUUID(),
        sourceId: sourceFile.id,
        cleanedTextId: text.id as string,
        chunksIds: chunkBatch?.map((chunk) => chunk.id),
        embeddingsIds: embeddingsDocuments.map((embedding) => embedding.id),
      };
      // await this.knowledgeAssetsRepository.saveKnowledgeAsset(knowledgeAsset);
      return knowledgeAsset;
    } catch (error) {
      throw error;
    }
  }

  async *generateNewKnowledgeStreamingState(
    command: GenerateNewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState> {
    const { source, chunkingStrategy, embeddingStrategy } = command;
    const sourceFile = source as FileUploadDTO;

    // await new Promise((resolve) => setTimeout(resolve, 300));
    // yield { status: "success", step: "file-upload", message: "File uploaded successfully" };
    // await new Promise((resolve) => setTimeout(resolve, 300));
    // yield { status: "success", step: "text-extraction", message: "Text extracted successfully" };
    // await new Promise((resolve) => setTimeout(resolve, 300));
    // yield { status: "error", step: "chunking", message: "Chunks generated successfully" };
    // await new Promise((resolve) => setTimeout(resolve, 300));
    // yield { status: "success", step: "embedding", message: "Embeddings generated successfully" };
    // await new Promise((resolve) => setTimeout(resolve, 300));
    // yield { status: "success", step: "knowledge-asset", message: "Knowledge asset generated successfully" };

    // return;

    try {
      const { status, message } = await this.filesApi.uploadFile(sourceFile);
      console.log(status, message);
      if (status === "ERROR") {
        yield { status: "ERROR", step: "file-upload", message :"File uploaded successfully"};
      }

      const text = await this.textExtractorApi.extractTextFromPDF({
        id: sourceFile.id,
        source: sourceFile,
      });
      if (text.status === "success") {
        yield { status: "SUCCESS", step: "text-extraction", message: "Text extracted successfully" };
      }
      const chunks = await this.chunkingApi.chunkOne(text.text as string, {
        strategy: chunkingStrategy,
      });
      if(chunks.status === "success") {
        yield { status: "SUCCESS", step: "chunking", message: "Chunks generated successfully" };
      }
      const chunkBatch = chunks.chunks as Chunk[];
      const chunksContent = chunkBatch.map((chunk) => chunk.content);
      const embeddings = await this.embeddingApi.generateEmbeddings(
        chunksContent
      );
      if(embeddings.status === "success") {
        yield { status: "SUCCESS", step: "embedding", message: "Embeddings generated successfully" };
      }
      const embeddingsDocuments = embeddings.documents as VectorDocument[];
      const knowledgeAsset: KnowledgeAssetDTO = {
        id: crypto.randomUUID(),
        sourceId: sourceFile.id,
        cleanedTextId: text.id as string,
        chunksIds: chunkBatch.map((chunk) => chunk.id),
        embeddingsIds: embeddingsDocuments.map((embedding) => embedding.id),
      };
      // await this.knowledgeAssetsRepository.saveKnowledgeAsset(knowledgeAsset);
      yield { status: "SUCCESS", step: "knowledge-asset", message: "Knowledge asset generated successfully" };
      // return knowledgeAsset;
    } catch (error) {
      console.log(error);
      yield { status: "ERROR", step: "knowledge-asset", message: "Knowledge asset generation failed" };
    }
  }
  async retrieveKnowledge(command: string): Promise<void> {}
}
