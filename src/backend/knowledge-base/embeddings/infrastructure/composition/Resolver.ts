import type { EmbeddingProvider } from "../../@core-contracts/providers";
import type { VectorRepository } from "../../@core-contracts/repositories";
import type { EmbeddingsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class EmbeddingsInfrastructureResolver {
  static async resolve(policy: EmbeddingsInfrastructurePolicy): Promise<{
    provider: EmbeddingProvider;
    repository: VectorRepository;
  }> {
    const provider = await EmbeddingsInfrastructureResolver.resolveProvider(policy.provider);
    const dimensions = provider.getDimensions();

    return {
      provider,
      repository: await EmbeddingsInfrastructureResolver.resolveRepository(policy.repository, dimensions),
    };
  }

  private static async resolveProvider(
    type: EmbeddingsInfrastructurePolicy["provider"]
  ): Promise<EmbeddingProvider> {
    const resolverTypes = {
      cohere: async () => {
        const { AIEmbeddingProvider } = await import("../providers/AIEmbeddingProvider");
        return new AIEmbeddingProvider();
      },
      "hugging-face": async () => {
        const { HuggingFaceEmbeddingProvider } = await import("../providers/HuggingFaceEmbeddingProvider");
        return new HuggingFaceEmbeddingProvider();
      },
      browser: async () => {
        const { BrowserEmbeddingProvider } = await import("../providers/BrowserEmbeddingProvider");
        return new BrowserEmbeddingProvider();
      },
      openai: async () => {
        // TODO: Create OpenAIProvider
        const { AIEmbeddingProvider } = await import("../providers/AIEmbeddingProvider");
        return new AIEmbeddingProvider();
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
      "local-level": async () => {
        const { LevelVectorStore } = await import("../repositories/LocalLevelVectorDB");
        return new LevelVectorStore({
          dimensions,
          similarityThreshold: 0.7,
          dbPath: "./embeddings.db",
        });
      },
      "remote-db": async () => {
        // TODO: Create RemoteVectorDB
        const { LevelVectorStore } = await import("../repositories/LocalLevelVectorDB");
        return new LevelVectorStore({
          dimensions,
          similarityThreshold: 0.7,
          dbPath: "./embeddings.db",
        });
      },
      browser: async () => {
        const { BrowserVectorDB } = await import("../repositories/BrowserVectorDB");
        return new BrowserVectorDB({
          dimensions,
          similarityThreshold: 0.7,
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