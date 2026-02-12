import type {
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
} from "./infra-policies";
import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { EmbeddingStrategy } from "../domain/ports/EmbeddingStrategy";
import type { ChunkingStrategy } from "../domain/ports/ChunkingStrategy";
import type { VectorStoreAdapter } from "../domain/ports/VectorStoreAdapter";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";
import type { ConfigProvider } from "../../../shared/config/index";

/**
 * Composer for the Projection Module.
 *
 * Responsible for resolving infrastructure dependencies based on policy.
 * Each aspect (repository, embedding, chunking, etc.) has its own resolver method.
 */
export class ProjectionComposer {
  // ─── Config Resolution ─────────────────────────────────────────────────────

  /**
   * Resolves the appropriate ConfigProvider based on policy.
   * Priority: configOverrides > process.env (NodeConfigProvider)
   */
  private static async resolveConfigProvider(
    policy: ProjectionInfrastructurePolicy
  ): Promise<ConfigProvider> {
    if (policy.configOverrides) {
      const { InMemoryConfigProvider } = await import(
        "../../../shared/config/InMemoryConfigProvider"
      );
      return new InMemoryConfigProvider(policy.configOverrides);
    }
    const { NodeConfigProvider } = await import(
      "../../../shared/config/NodeConfigProvider"
    );
    return new NodeConfigProvider();
  }

  // ─── Repository Resolution ────────────────────────────────────────────────

  private static async resolveRepository(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<SemanticProjectionRepository> {
    switch (policy.type) {
      case "in-memory": {
        const { InMemorySemanticProjectionRepository } = await import(
          "../infrastructure/persistence/InMemorySemanticProjectionRepository"
        );
        return new InMemorySemanticProjectionRepository();
      }

      case "browser": {
        const { IndexedDBSemanticProjectionRepository } = await import(
          "../infrastructure/persistence/indexeddb/IndexedDBSemanticProjectionRepository"
        );
        const dbName = policy.dbName ?? "knowledge-platform";
        return new IndexedDBSemanticProjectionRepository(dbName);
      }

      case "server": {
        const { NeDBSemanticProjectionRepository } = await import(
          "../infrastructure/persistence/nedb/NeDBSemanticProjectionRepository"
        );
        const filename = policy.dbPath
          ? `${policy.dbPath}/semantic-projections.db`
          : undefined;
        return new NeDBSemanticProjectionRepository(filename);
      }

      default:
        throw new Error(`Unknown policy type: ${(policy as any).type}`);
    }
  }

  // ─── Embedding Strategy Resolution ────────────────────────────────────────

  private static async resolveEmbeddingStrategy(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<EmbeddingStrategy> {
    console.log({ policy });

    // 1. If explicit embeddingProvider is set (and not "hash"), use AI SDK
    if (policy.embeddingProvider && policy.embeddingProvider !== "hash") {
      return this.resolveAIEmbeddingStrategy(policy);
    }

    // 2. Fallback legacy: aiSdkEmbeddingModel pre-configured (deprecated)
    if (policy.aiSdkEmbeddingModel) {
      const { AISdkEmbeddingStrategy } = await import(
        "../infrastructure/strategies/AISdkEmbeddingStrategy"
      );
      return new AISdkEmbeddingStrategy(policy.aiSdkEmbeddingModel);
    }

    // 3. Browser uses WebLLM
    if (policy.type === "browser") {
      const { WebLLMEmbeddingStrategy } = await import(
        "../infrastructure/strategies/WebLLMEmbeddingStrategy"
      );
      const strategy = new WebLLMEmbeddingStrategy(policy.webLLMModelId);
      await strategy.initialize();
      return strategy;
    }

    // 4. Default: hash embeddings (in-memory, server without provider)
    const { HashEmbeddingStrategy } = await import(
      "../infrastructure/strategies/HashEmbeddingStrategy"
    );
    return new HashEmbeddingStrategy(policy.embeddingDimensions ?? 128);
  }

  // ─── AI Embedding Strategy Resolution ──────────────────────────────────────

  /**
   * Resolves an AI SDK embedding strategy based on the configured provider.
   * Automatically creates the model with API key from ConfigProvider.
   */
  private static async resolveAIEmbeddingStrategy(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<EmbeddingStrategy> {
    const config = await this.resolveConfigProvider(policy);
    const provider = policy.embeddingProvider!;

    const { AISdkEmbeddingStrategy } = await import(
      "../infrastructure/strategies/AISdkEmbeddingStrategy"
    );

    switch (provider) {
      case "openai": {
        const apiKey = config.require("OPENAI_API_KEY");
        const modelId = policy.embeddingModel ?? "text-embedding-3-small";
        const { createOpenAI } = await import("@ai-sdk/openai");
        const openai = createOpenAI({ apiKey });
        const model = openai.embedding(modelId);
        return new AISdkEmbeddingStrategy(model, `openai-${modelId}`);
      }

      case "cohere": {
        const apiKey = config.require("COHERE_API_KEY");
        const modelId = policy.embeddingModel ?? "embed-multilingual-v3.0";
        const { createCohere } = await import("@ai-sdk/cohere");
        const cohere = createCohere({ apiKey });
        const model = cohere.textEmbeddingModel(modelId);
        return new AISdkEmbeddingStrategy(model, `cohere-${modelId}`);
      }

      case "huggingface": {
        const apiKey = config.require("HUGGINGFACE_API_KEY");
        const modelId =
          policy.embeddingModel ?? "sentence-transformers/all-MiniLM-L6-v2";
        const { createHuggingFace } = await import("@ai-sdk/huggingface");
        const hf = createHuggingFace({ apiKey });
        const model = hf.textEmbeddingModel(modelId);
        return new AISdkEmbeddingStrategy(model, `huggingface-${modelId}`);
      }

      default:
        throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }

  // ─── Chunking Strategy Resolution ─────────────────────────────────────────

  private static async resolveChunkingStrategy(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<ChunkingStrategy> {
    // Side-effect: register default chunking strategies
    await import("../infrastructure/strategies/index");
    const { ChunkerFactory } = await import(
      "../infrastructure/strategies/ChunkerFactory"
    );
    return ChunkerFactory.create(policy.chunkingStrategyId ?? "recursive");
  }

  // ─── Vector Store Resolution ──────────────────────────────────────────────

  private static async resolveVectorStore(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<VectorStoreAdapter> {
    // Use shared vector store if provided (for cross-context wiring)
    if (policy.sharedVectorStore) {
      return policy.sharedVectorStore;
    }

    // Otherwise create a new in-memory store
    // In production, this could be Pinecone, Weaviate, etc.
    const { InMemoryVectorStore } = await import(
      "../infrastructure/adapters/InMemoryVectorStore"
    );
    return new InMemoryVectorStore();
  }

  // ─── Event Publisher Resolution ───────────────────────────────────────────

  private static async resolveEventPublisher(
    _policy: ProjectionInfrastructurePolicy,
  ): Promise<EventPublisher> {
    // Currently all policies use InMemoryEventPublisher
    // This can be extended to support distributed publishers (Redis, Kafka, etc.)
    const { InMemoryEventPublisher } = await import(
      "../../../shared/infrastructure/InMemoryEventPublisher"
    );
    return new InMemoryEventPublisher();
  }

  // ─── Main Resolution ──────────────────────────────────────────────────────

  static async resolve(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<ResolvedProjectionInfra> {
    const [
      repository,
      embeddingStrategy,
      chunkingStrategy,
      vectorStore,
      eventPublisher,
    ] = await Promise.all([
      this.resolveRepository(policy),
      this.resolveEmbeddingStrategy(policy),
      this.resolveChunkingStrategy(policy),
      this.resolveVectorStore(policy),
      this.resolveEventPublisher(policy),
    ]);

    return {
      repository,
      embeddingStrategy,
      chunkingStrategy,
      vectorStore,
      eventPublisher,
    };
  }
}
