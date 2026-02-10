import type {
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
} from "./infra-policies";
import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { EmbeddingStrategy } from "../domain/ports/EmbeddingStrategy";
import type { ChunkingStrategy } from "../domain/ports/ChunkingStrategy";
import type { VectorStoreAdapter } from "../domain/ports/VectorStoreAdapter";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

/**
 * Composer for the Projection Module.
 *
 * Responsible for resolving infrastructure dependencies based on policy.
 * Each aspect (repository, embedding, chunking, etc.) has its own resolver method.
 */
export class ProjectionComposer {
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
    switch (policy.type) {
      case "in-memory": {
        const { HashEmbeddingStrategy } = await import(
          "../infrastructure/strategies/HashEmbeddingStrategy"
        );
        return new HashEmbeddingStrategy(policy.embeddingDimensions ?? 128);
      }

      case "browser": {
        const { WebLLMEmbeddingStrategy } = await import(
          "../infrastructure/strategies/WebLLMEmbeddingStrategy"
        );
        const strategy = new WebLLMEmbeddingStrategy(policy.webLLMModelId);
        await strategy.initialize();
        return strategy;
      }

      case "server": {
        if (!policy.aiSdkEmbeddingModel) {
          throw new Error("Projection server policy requires 'aiSdkEmbeddingModel'");
        }
        const { AISdkEmbeddingStrategy } = await import(
          "../infrastructure/strategies/AISdkEmbeddingStrategy"
        );
        return new AISdkEmbeddingStrategy(policy.aiSdkEmbeddingModel);
      }

      default:
        throw new Error(`Unknown policy type: ${(policy as any).type}`);
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
