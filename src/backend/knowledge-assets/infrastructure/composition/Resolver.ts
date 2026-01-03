import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";
import type { KnowledgeAssetsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import type { FilesApi } from "../../../files/@core-contracts/api";
import type { TextExtractorApi } from "../../../text-extraction/@core-contracts/api";
import type { ChunkingApi } from "../../../chunking/@core-contracts/api";
import type { EmbeddingAPI } from "../../../embeddings/@core-contracts/api";
import { filesApiFactory } from "../../../files";
import { textExtractorApiFactory } from "../../../text-extraction";
import { chunkingApiFactory } from "../../../chunking";
import { embeddingApiFactory } from "../../../embeddings";
import { LocalLevelRepository } from "../repositories/LocalLevelRepository";

export class KnowledgeAssetsInfrastructureResolver {
  static resolve(policy: KnowledgeAssetsInfrastructurePolicy): {
    repository: KnowledgeAssetsRepository;
    filesApi: FilesApi;
    textExtractorApi: TextExtractorApi;
    chunkingApi: ChunkingApi;
    embeddingApi: EmbeddingAPI;
  } {
    return {
      repository: KnowledgeAssetsInfrastructureResolver.resolveRepository(
        policy.repository
      ),
      filesApi: filesApiFactory(policy.filesPolicy),
      textExtractorApi: textExtractorApiFactory(policy.textExtractionPolicy),
      chunkingApi: chunkingApiFactory(policy.chunkingPolicy),
      embeddingApi: embeddingApiFactory(policy.embeddingsPolicy),
    };
  }

  private static resolveRepository(
    type: KnowledgeAssetsInfrastructurePolicy["repository"]
  ): KnowledgeAssetsRepository {
    const repositories = {
      "local-level": LocalLevelRepository,
      "remote-db": LocalLevelRepository,
    };
    if (!repositories[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return new repositories[type]();
  }
}
