import type { EmbeddingProvider } from "../../@core-contracts/providers";
import type { VectorRepository } from "../../@core-contracts/repositories";
import type { EmbeddingsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class EmbeddingsInfrastructureResolver {
  static async resolve(policy: EmbeddingsInfrastructurePolicy): Promise<{
    provider: EmbeddingProvider;
    repository: VectorRepository;
  }> {
    const provider = await EmbeddingsInfrastructureResolver.resolveProvider(
      policy.provider
    );
    const dimensions = provider.getDimensions();

    return {
      provider,
      repository: await EmbeddingsInfrastructureResolver.resolveRepository(
        policy.repository,
        dimensions
      ),
    };
  }

  private static async resolveProvider(
    type: EmbeddingsInfrastructurePolicy["provider"]
  ): Promise<EmbeddingProvider> {
    const resolverTypes = {
      "vercel-ai": async () => {
        const { AIEmbeddingProvider } = await import(
          "../providers/AIEmbeddingProvider"
        );
        return new AIEmbeddingProvider();
      },
      "node-hf": async () => {
        const { NodeHFEmbeddingProvider } = await import(
          "../providers/NodeHFEmbeddingProvider"
        );
        return new NodeHFEmbeddingProvider();
      },
      "browser-hf": async () => {
        const { BrowserHFEmbeddingProvider } = await import(
          "../providers/BrowserHFEmbeddingProvider"
        );
        return new BrowserHFEmbeddingProvider();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported provider: ${type}`);
    }
    return resolverTypes[type]();
  }

  private static async resolveRepository(
    type: EmbeddingsInfrastructurePolicy["repository"],
    dimensions: number
  ): Promise<VectorRepository> {
    const resolverTypes = {
      leveldb: async () => {
        const { LevelDBVectorStore } = await import(
          "../repositories/LevelDBVectorStore"
        );
        return new LevelDBVectorStore({
          dimensions,
          similarityThreshold: 0.5,
          dbPath: "./embeddings.db",
        });
      },
      idb: async () => {
        const { IDBVectorStore } = await import(
          "../repositories/IDBVectorStore"
        );
        return new IDBVectorStore({
          dimensions,
          similarityThreshold: 0.5,
          dbName: "embeddings-db",
        });
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
}
