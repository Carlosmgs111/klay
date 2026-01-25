import type { KnowledgeAssetApi } from "../@core-contracts/api";
import { Result } from "@/modules/shared/@core-contracts/result";
import type {
  FullKnowledgeAssetDTO,
  KnowledgeAssetDTO,
  NewKnowledgeDTO,
} from "../@core-contracts/dtos";
import type { KnowledgeAssetsRepository } from "../@core-contracts/repositories";
import { KnowledgeAsset } from "../domain/aggregate/KnowledgeAsset";
import type { EmbeddingAPI } from "@/modules/knowledge-base/embeddings/@core-contracts/api";
import type { ChunkingApi } from "@/modules/knowledge-base/chunking/@core-contracts/api";
import type { TextExtractorApi } from "@/modules/knowledge-base/text-extraction/@core-contracts/api";
import type { FilesApi } from "@/modules/files/@core-contracts/api";
import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type { Chunk } from "@/modules/knowledge-base/chunking/@core-contracts/entities";
import type { FlowState } from "../@core-contracts/dtos";
import { KnowledgeAssetNotFoundError } from "../domain/errors/KnowledgeAssetNotFoundError";
import { NoKnowledgeAssetsCreatedError } from "../domain/errors/NoKnowledgeAssetsCreatedError";
import { KnowledgeAssetCouldNotBeSavedError } from "../domain/errors/KnowledgeAssetCouldNotBeSavedError";

export class KnowledgeAssetUseCases implements KnowledgeAssetApi {
  private repository: KnowledgeAssetsRepository;
  private embeddingApi: EmbeddingAPI;
  private chunkingApi: ChunkingApi;
  private textExtractorApi: TextExtractorApi;
  private filesApi: FilesApi;
  constructor(
    repository: KnowledgeAssetsRepository,
    embeddingApi: EmbeddingAPI,
    chunkingApi: ChunkingApi,
    textExtractorApi: TextExtractorApi,
    filesApi: FilesApi
  ) {
    this.repository = repository;
    this.embeddingApi = embeddingApi;
    this.chunkingApi = chunkingApi;
    this.textExtractorApi = textExtractorApi;
    this.filesApi = filesApi;
  }

  async generateKnowledgeAsset(
    command: NewKnowledgeDTO
  ): Promise<Result<KnowledgeAssetCouldNotBeSavedError, KnowledgeAssetDTO>> {
    // Create a new knowledge asset

    try {
      const knowledgeAssetId = crypto.randomUUID();
      const { sources, chunkingStrategy } = command;
      const sourceFile = sources[0] as FileUploadDTO;

      const { status, message } = await this.filesApi.uploadFile({
        file: sourceFile,
      });
      console.log(status, message);
      if (status === "ERROR") {
        throw new Error(message);
      }

      const textId = crypto.randomUUID();
      const text = await this.textExtractorApi.extractTextFromPDF({
        id: textId,
        source: sourceFile,
      });
      if (text.status === "error") {
        throw new Error(text.message);
      }

      const chunks = await this.chunkingApi.chunkOne(text.content as string, {
        strategy: chunkingStrategy,
      });
      const chunkBatch = chunks.chunks as Chunk[];
      const chunksContent = chunkBatch?.map((chunk) => ({
        id: crypto.randomUUID(),
        content: chunk.content,
        metadata: { sourceId: sourceFile.id },
      }));

      const embeddingsCollectionId = `embeddings-${knowledgeAssetId}`;
      const embeddings = await this.embeddingApi.generateEmbeddings({
        texts: chunksContent,
        collectionId: embeddingsCollectionId,
      });

      const knowledgeAsset: KnowledgeAsset = new KnowledgeAsset({
        name: command.name,
        id: knowledgeAssetId,
        filesIds: [sourceFile.id],
        textsIds: [textId],
        embeddingsCollectionsIds: [embeddingsCollectionId],
        metadata: command.metadata,
        version: "1",
      });

      await this.repository.saveKnowledgeAsset(knowledgeAsset);
      return Result.success(knowledgeAsset);
    } catch (error) {
      return Result.failure(error as KnowledgeAssetCouldNotBeSavedError);
    }
  }

  async *generateKnowledgeAssetStreamingState(
    command: NewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState> {
    try {
      const knowledgeAssetId = crypto.randomUUID();
      const { sources, chunkingStrategy, name } = command;
      const sourceFile = sources[0] as FileUploadDTO;
      console.log({ sourceFile });

      const { status, message } = await this.filesApi.uploadFile({
        file: sourceFile,
      });
      console.log({ status, message });
      if (status === "ERROR") {
        throw new Error(message);
      }
      yield {
        status: "SUCCESS",
        step: "file-upload",
        message: "File uploaded successfully",
      };

      const textId = crypto.randomUUID();
      const text = await this.textExtractorApi.extractTextFromPDF({
        id: textId,
        source: sourceFile,
      });
      console.log({ text });
      if (text.status === "error") {
        throw new Error(text.message);
      }
      yield {
        status: "SUCCESS",
        step: "text-extraction",
        message: "Text extracted successfully",
      };

      const chunks = await this.chunkingApi.chunkOne(text.content as string, {
        strategy: chunkingStrategy,
      });
      console.log({ chunks });
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

      const embeddingsCollectionId = `embeddings-${knowledgeAssetId}`;
      const embeddings = await this.embeddingApi.generateEmbeddings({
        texts: chunksContent,
        collectionId: embeddingsCollectionId,
      });
      if (embeddings.status === "success") {
        yield {
          status: "SUCCESS",
          step: "embedding",
          message: "Embeddings generated successfully",
        };
      }

      const newKnowledgeAsset: KnowledgeAsset = new KnowledgeAsset({
        name: name,
        id: knowledgeAssetId,
        filesIds: [sourceFile.id],
        textsIds: [textId],
        embeddingsCollectionsIds: [embeddingsCollectionId],
        metadata: {},
        version: "1",
      });
      this.repository.saveKnowledgeAsset(newKnowledgeAsset);
      yield {
        status: "SUCCESS",
        step: "knowledge-asset",
        message: "Knowledge asset generated successfully",
      };
    } catch (error) {
      yield {
        status: "ERROR",
        step: "chunking",
        message: "Chunks generation failed",
      };
    }
  }

  async addSourceToKnowledgeAsset(
    knowledgeAssetId: string,
    source: FileUploadDTO
  ): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>> {
    const knowledgeAsset = await this.repository.getKnowledgeAssetById(
      knowledgeAssetId
    );
    if (!knowledgeAsset.isSuccess) {
      return Result.failure(knowledgeAsset.getError());
    }
    const newKnowledgeAsset: KnowledgeAsset = new KnowledgeAsset(
      knowledgeAsset.getValue()
    );
    await this.repository.saveKnowledgeAsset(newKnowledgeAsset);
    return Result.success(newKnowledgeAsset);
  }

  async retrieveKnowledge(
    knowledgeAssetId: string,
    query: string
  ): Promise<Result<KnowledgeAssetNotFoundError, string[]>> {
    try {
      const knowledgeAsset = await this.repository.getKnowledgeAssetById(
        knowledgeAssetId
      );
      if (!knowledgeAsset.isSuccess) {
        throw Result.failure(knowledgeAsset.getError());
      }
      const searchResult = await this.embeddingApi.search({
        text: query,
        topK: 5,
        collectionId: knowledgeAsset.getValue().embeddingsCollectionsIds[0],
      });
      const similarQuery = searchResult.map((query) => query.document.content);
      return Result.success(similarQuery);
    } catch (error) {
      throw error;
    }
  }

  async getFullKnowledgeAssetById(id: string): Promise<Result<KnowledgeAssetNotFoundError, FullKnowledgeAssetDTO>> {
    const knowledgeAsset = await this.repository.getKnowledgeAssetById(id);
    const file = await this.filesApi.getFileById(
      knowledgeAsset.getValue().filesIds[0]
    );
    const text = await this.textExtractorApi.getOneText(
      knowledgeAsset.getValue().textsIds[0]
    );
    const embeddings = await this.embeddingApi.getAllDocuments({
      collectionId: knowledgeAsset.getValue().embeddingsCollectionsIds[0],
    });
    return Result.success({
      ...knowledgeAsset.getValue(),
      files: [file],
      texts: [text],
      embeddings,
    });
  }

  async getAllKnowledgeAssets(): Promise<
    Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>
  > {
    const allKnowledgeAssets = await this.repository.getAllKnowledgeAssets();
    console.log({ allKnowledgeAssets });
    return Result.success(
      allKnowledgeAssets
        .getValue()
        .map((knowledgeAsset) => new KnowledgeAsset(knowledgeAsset))
    );
  }

  async getKnowledgeAssetById(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, KnowledgeAsset>> {
    const knowledgeAsset = await this.repository.getKnowledgeAssetById(id);
    if (!knowledgeAsset.isSuccess) {
      return Result.failure(knowledgeAsset.getError());
    }
    return Result.success(new KnowledgeAsset(knowledgeAsset.getValue()));
  }

  async deleteKnowledgeAsset(
    id: string
  ): Promise<Result<KnowledgeAssetNotFoundError, boolean>> {
    const knowledgeAsset = await this.repository.deleteKnowledgeAsset(id);
    if (!knowledgeAsset.isSuccess) {
      return Result.failure(knowledgeAsset.getError());
    }
    return Result.success(knowledgeAsset.getValue());
  }
}
