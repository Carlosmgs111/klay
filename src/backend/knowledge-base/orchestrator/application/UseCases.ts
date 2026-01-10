import type { NewKnowledgeDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { FilesApi } from "@/modules/files/@core-contracts/api";
import type { TextExtractorApi } from "@/modules/knowledge-base/text-extraction/@core-contracts/api";
import type { ChunkingApi } from "@/modules/knowledge-base/chunking/@core-contracts/api";
import type { EmbeddingAPI } from "@/modules/knowledge-base/embeddings/@core-contracts/api";
import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type { KnowledgeAssetDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { FlowState } from "../@core-contracts/api";
import type { Chunk } from "@/modules/knowledge-base/chunking/@core-contracts/entities";
import type { VectorDocument } from "@/modules/knowledge-base/embeddings/@core-contracts/entities";
import type { KnowledgeAssetApi } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/api";

export class UseCases {
  constructor(
    private filesApi: FilesApi,
    private textExtractorApi: TextExtractorApi,
    private chunkingApi: ChunkingApi,
    private embeddingApi: EmbeddingAPI,
    private knowledgeAssetApi: KnowledgeAssetApi,
  ) {}
  /**
   * This function generates a new knowledge asset from a file.
   * @param command The command to generate a new knowledge asset.
   * @returns A promise that resolves when the knowledge asset is generated.
   */
  async generateNewKnowledge(
    command: NewKnowledgeDTO
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
      const chunksContent = chunkBatch?.map((chunk) => ({
        id: crypto.randomUUID(),
        content: chunk.content,
        metadata: { sourceId: sourceFile.id },
      }));
      const embeddings = await this.embeddingApi.generateEmbeddings(
        chunksContent
      );
      const embeddingsDocuments = embeddings.documents as VectorDocument[];
      const knowledgeAsset: NewKnowledgeDTO = {
        source: sourceFile,
        chunkingStrategy,
        embeddingStrategy,
        cleanedTextId: text.id as string,
        embeddingsIds: embeddingsDocuments.map((embedding) => embedding.id),
      };
    
      const result = await this.knowledgeAssetApi.generateKnowledgeAsset(knowledgeAsset);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async *generateNewKnowledgeStreamingState(
    command: NewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState> {
    const { source, chunkingStrategy, embeddingStrategy } = command;
    const sourceFile = source as FileUploadDTO;

    try {
      const { status, message } = await this.filesApi.uploadFile(sourceFile);
      console.log(status, message);
      if (status === "SUCCESS") {
        yield {
          status: "SUCCESS",
          step: "file-upload",
          message: "File uploaded successfully",
        };
      }

      const text = await this.textExtractorApi.extractTextFromPDF({
        id: crypto.randomUUID(),
        source: sourceFile,
      });
      if (text.status === "success") {
        yield {
          status: "SUCCESS",
          step: "text-extraction",
          message: "Text extracted successfully",
        };
      }
      const chunks = await this.chunkingApi.chunkOne(text.text as string, {
        strategy: chunkingStrategy,
      });
      if (chunks.status === "success") {
        yield {
          status: "SUCCESS",
          step: "chunking",
          message: "Chunks generated successfully",
        };
      }
      const chunkBatch = chunks.chunks as Chunk[];
      const chunksContent = chunkBatch.map((chunk) => ({
        id: crypto.randomUUID(),
        content: chunk.content,
        metadata: { sourceId: sourceFile.id },
        timestamp: Date.now(),
      }));
      const embeddings = await this.embeddingApi.generateEmbeddings(
        chunksContent
      );
      if (embeddings.status === "success") {
        yield {
          status: "SUCCESS",
          step: "embedding",
          message: "Embeddings generated successfully",
        };
      }
      const embeddingsDocuments = embeddings.documents as VectorDocument[];

      const newKnowledgeDTO: NewKnowledgeDTO = {
        source: sourceFile,
        chunkingStrategy,
        embeddingStrategy,
        cleanedTextId: text.id as string,
        embeddingsIds: embeddingsDocuments.map((embedding) => embedding.id),
      };
      const knowledgeAsset = await this.knowledgeAssetApi.generateKnowledgeAsset(newKnowledgeDTO);
      yield {
        status: "SUCCESS",
        step: "knowledge-asset",
        message: "Knowledge asset generated successfully",
      };
      // return knowledgeAsset;
    } catch (error) {
      console.log(error);
      yield {
        status: "ERROR",
        step: "knowledge-asset",
        message: "Knowledge asset generation failed",
      };
    }
  }
  async retrieveKnowledge(command: string): Promise<void> {}
}
