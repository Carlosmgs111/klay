import type { EmbeddingProvider } from "../../@core-contracts/providers";
import type { VectorRepository } from "../../@core-contracts/repositories";
import type { EmbeddingsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import { AIEmbeddingProvider } from "../providers/AIEmbeddingProvider";
import { HuggingFaceEmbeddingProvider } from "../providers/HuggingFaceEmbeddingProvider";
import { LevelVectorStore } from "../repositories/LocalLevelVectorDB";
import { BrowserVectorDB } from "../repositories/BrowserVectorDB";

export class EmbeddingsInfrastructureResolver {
  static resolve(policy: EmbeddingsInfrastructurePolicy): {
    provider: EmbeddingProvider;
    repository: VectorRepository;
  } {
    return {
      provider: EmbeddingsInfrastructureResolver.resolveProvider(policy.provider),
      repository: EmbeddingsInfrastructureResolver.resolveRepository(policy.repository),
    };
  }

  private static resolveProvider(
    type: EmbeddingsInfrastructurePolicy["provider"]
  ): EmbeddingProvider {
    const providers = {
      "cohere": new AIEmbeddingProvider(),
      "hugging-face": new HuggingFaceEmbeddingProvider(),
      "openai": new AIEmbeddingProvider(),       // TODO: Create OpenAIProvider
    };
    if (!providers[type]) {
      throw new Error(`Unsupported provider: ${type}`);
    }
    return providers[type];
  }

  private static resolveRepository(
    type: EmbeddingsInfrastructurePolicy["repository"]
  ): VectorRepository {
    const repositories = {
      "local-level": () => new LevelVectorStore({
        dimensions: 1024,
        similarityThreshold: 0.7,
        dbPath: "./embeddings.db",
      }),
      "remote-db": () => new LevelVectorStore({ // TODO: Create RemoteVectorDB
        dimensions: 1024,
        similarityThreshold: 0.7,
        dbPath: "./embeddings.db",
      }),
      "browser": () => new BrowserVectorDB({
        dimensions: 1024,
        similarityThreshold: 0.7,
        dbName: "embeddings-db",
      }),
    };
    if (!repositories[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return repositories[type]();
  }
}