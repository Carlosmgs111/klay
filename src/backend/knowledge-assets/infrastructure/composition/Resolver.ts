import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import type { KnowledgeAssetsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import type { FilesApi } from "../../../files/@core-contracts/api";
import type { TextExtractorApi } from "../../../text-extraction/@core-contracts/api";
import type { ChunkingApi } from "../../../chunking/@core-contracts/api";
import type { EmbeddingAPI } from "../../../embeddings/@core-contracts/api";

export class KnowledgeAssetsInfrastructureResolver {
  static async resolve(policy: KnowledgeAssetsInfrastructurePolicy): Promise<{
    repository: KnowledgeAssetsRepository;
    filesApi: FilesApi;
    textExtractorApi: TextExtractorApi;
    chunkingApi: ChunkingApi;
    embeddingApi: EmbeddingAPI;
  }> {
    const [repository, filesApi, textExtractorApi, chunkingApi, embeddingApi] = await Promise.all([
      KnowledgeAssetsInfrastructureResolver.resolveRepository(policy.repository),
      KnowledgeAssetsInfrastructureResolver.resolveFilesApi(policy.filesPolicy),
      KnowledgeAssetsInfrastructureResolver.resolveTextExtractorApi(policy.textExtractionPolicy),
      KnowledgeAssetsInfrastructureResolver.resolveChunkingApi(policy.chunkingPolicy),
      KnowledgeAssetsInfrastructureResolver.resolveEmbeddingApi(policy.embeddingsPolicy),
    ]);

    return {
      repository,
      filesApi,
      textExtractorApi,
      chunkingApi,
      embeddingApi,
    };
  }

  private static async resolveRepository(
    type: KnowledgeAssetsInfrastructurePolicy["repository"]
  ): Promise<KnowledgeAssetsRepository> {
    switch (type) {
      case "local-level": {
        const { LocalLevelRepository } = await import("../repositories/LocalLevelRepository");
        return new LocalLevelRepository();
      }
      case "remote-db": {
        // TODO: Create RemoteRepository
        const { LocalLevelRepository } = await import("../repositories/LocalLevelRepository");
        return new LocalLevelRepository();
      }
      case "browser": {
        const { BrowserRepository } = await import("../repositories/BrowserRepository");
        return new BrowserRepository();
      }
      default:
        throw new Error(`Unsupported repository: ${type}`);
    }
  }

  private static async resolveFilesApi(policy: any): Promise<FilesApi> {
    const { filesApiFactory } = await import("../../../files");
    return await filesApiFactory(policy);
  }

  private static async resolveTextExtractorApi(policy: any): Promise<TextExtractorApi> {
    const { textExtractorApiFactory } = await import("../../../text-extraction");
    return await textExtractorApiFactory(policy);
  }

  private static async resolveChunkingApi(policy: any): Promise<ChunkingApi> {
    const { chunkingApiFactory } = await import("../../../chunking");
    return await chunkingApiFactory(policy);
  }

  private static async resolveEmbeddingApi(policy: any): Promise<EmbeddingAPI> {
    const { embeddingApiFactory } = await import("../../../embeddings");
    return await embeddingApiFactory(policy);
  }
}
