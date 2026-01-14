import type { KnowledgeAssetsRepository } from "../../../knowledge-asset/@core-contracts/repositories";
import type { KnowledgeAssetsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import type { FilesApi } from "@/modules/files/@core-contracts/api";
import type { TextExtractorApi } from "@/modules/knowledge-base/text-extraction/@core-contracts/api";
import type { ChunkingApi } from "@/modules/knowledge-base/chunking/@core-contracts/api";
import type { EmbeddingAPI } from "@/modules/knowledge-base/embeddings/@core-contracts/api";
import type { KnowledgeAssetApi } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/api";

export class KnowledgeAssetsInfrastructureResolver {
  static async resolve(policy: KnowledgeAssetsInfrastructurePolicy): Promise<{
    knowledgeAssetApi: KnowledgeAssetApi;
  }> {
    const [filesApi, textExtractorApi, chunkingApi, embeddingApi] =
      await Promise.all([
        KnowledgeAssetsInfrastructureResolver.resolveFilesApi(
          policy.filesPolicy
        ),
        KnowledgeAssetsInfrastructureResolver.resolveTextExtractorApi(
          policy.textExtractionPolicy
        ),
        KnowledgeAssetsInfrastructureResolver.resolveChunkingApi(
          policy.chunkingPolicy
        ),
        KnowledgeAssetsInfrastructureResolver.resolveEmbeddingApi(
          policy.embeddingsPolicy
        ),
      ]);

    const knowledgeAssetApi =
      await KnowledgeAssetsInfrastructureResolver.resolveKnowledgeAssetApi(
        policy.knowledgeAssetPolicy,
        filesApi,
        textExtractorApi,
        chunkingApi,
        embeddingApi
      );

    return {
      knowledgeAssetApi,
    };
  }

  private static async resolveFilesApi(policy: any): Promise<FilesApi> {
    const { filesApiFactory } = await import("@/modules/files");
    return await filesApiFactory(policy);
  }

  private static async resolveTextExtractorApi(
    policy: any
  ): Promise<TextExtractorApi> {
    const { textExtractorApiFactory } = await import(
      "@/modules/knowledge-base/text-extraction"
    );
    return await textExtractorApiFactory(policy);
  }

  private static async resolveChunkingApi(policy: any): Promise<ChunkingApi> {
    const { chunkingApiFactory } = await import(
      "@/modules/knowledge-base/chunking"
    );
    return await chunkingApiFactory(policy);
  }

  private static async resolveEmbeddingApi(policy: any): Promise<EmbeddingAPI> {
    const { embeddingApiFactory } = await import(
      "@/modules/knowledge-base/embeddings"
    );
    return await embeddingApiFactory(policy);
  }

  private static async resolveKnowledgeAssetApi(
    policy: any,
    filesApi: FilesApi,
    textExtractorApi: TextExtractorApi,
    chunkingApi: ChunkingApi,
    embeddingApi: EmbeddingAPI
  ): Promise<KnowledgeAssetApi> {
    const { knowledgeAssetApiFactory } = await import(
      "@/modules/knowledge-base/knowledge-asset"
    );
    console.log(policy, knowledgeAssetApiFactory);
    return await knowledgeAssetApiFactory(
      policy,
      filesApi,
      textExtractorApi,
      chunkingApi,
      embeddingApi
    );
  }
}
