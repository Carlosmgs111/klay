import type { EmbeddingProvider } from "../../@core-contracts/providers";
import type { VectorRepository } from "../../@core-contracts/repositories";
import type { EmbeddingsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import { AIEmbeddingProvider } from "../providers/AIEmbeddingProvider";
import { HuggingFaceEmbeddingProvider } from "../providers/HuggingFaceEmbeddingProvider";
import { LevelVectorStore } from "../repositories/LocalLevelVectorDB";

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
      "local-level": LevelVectorStore,
      "remote-db": LevelVectorStore, // TODO: Create RemoteVectorDB
    };
    if (!repositories[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return new repositories[type]({
      dimensions: 1024,
      similarityThreshold: 0.7,
      dbPath: "./embeddings.db",
    });
  }
}