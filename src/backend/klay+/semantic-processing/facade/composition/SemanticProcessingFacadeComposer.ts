import type {
  SemanticProcessingFacadePolicy,
  ResolvedSemanticProcessingModules,
} from "./infra-policies";
import type { ProjectionInfrastructurePolicy } from "../../projection/composition/index";
import type { StrategyRegistryInfrastructurePolicy } from "../../strategy-registry/composition/index";
import type { VectorStoreAdapter } from "../../projection/domain/ports/VectorStoreAdapter";

/**
 * Composer for the Semantic Processing Facade.
 *
 * This is a COMPOSITION component - it only:
 * - Selects infrastructure implementations based on policy
 * - Instantiates modules via their factories
 * - Wires dependencies for the facade
 *
 * It does NOT contain:
 * - Business logic
 * - Domain rules
 * - Application flows
 */
export class SemanticProcessingFacadeComposer {
  // ─── Vector Store Resolution ──────────────────────────────────────────────

  private static async resolveVectorStore(
    _policy: SemanticProcessingFacadePolicy,
  ): Promise<VectorStoreAdapter> {
    // For all environments, we use InMemoryVectorStore
    // In production, this could be replaced with Pinecone, Weaviate, etc.
    const { InMemoryVectorStore } = await import(
      "../../projection/infrastructure/adapters/InMemoryVectorStore"
    );
    return new InMemoryVectorStore();
  }

  // ─── Main Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves all modules for the Semantic Processing context.
   * Uses dynamic imports for tree-shaking and environment-specific loading.
   */
  static async resolve(
    policy: SemanticProcessingFacadePolicy,
  ): Promise<ResolvedSemanticProcessingModules> {
    // Create a shared vector store that will be exposed to other contexts
    const vectorStore = await this.resolveVectorStore(policy);

    // Build module-specific policies inheriting from facade defaults
    // Pass the shared vector store so projection module uses the same instance
    const projectionPolicy: ProjectionInfrastructurePolicy = {
      type: policy.overrides?.projection?.type ?? policy.type,
      dbPath: policy.overrides?.projection?.dbPath ?? policy.dbPath,
      dbName: policy.overrides?.projection?.dbName ?? policy.dbName,
      embeddingDimensions: policy.overrides?.projection?.embeddingDimensions ??
                           policy.embeddingDimensions,
      chunkingStrategyId: policy.overrides?.projection?.chunkingStrategyId ??
                          policy.defaultChunkingStrategy,
      sharedVectorStore: vectorStore, // Wire shared store for cross-context queries
      aiSdkEmbeddingModel: policy.aiSdkModelId, // Map facade's aiSdkModelId to projection's aiSdkEmbeddingModel
    };

    const strategyRegistryPolicy: StrategyRegistryInfrastructurePolicy = {
      type: policy.overrides?.strategyRegistry?.type ?? policy.type,
      dbPath: policy.overrides?.strategyRegistry?.dbPath ?? policy.dbPath,
      dbName: policy.overrides?.strategyRegistry?.dbName ?? policy.dbName,
    };

    // Resolve modules in parallel using their factories (from composition/)
    // Factories return { useCases, infra } - we extract useCases for the facade
    const [projectionResult, strategyRegistryResult] = await Promise.all([
      import("../../projection/composition/projection.factory").then((m) =>
        m.projectionFactory(projectionPolicy),
      ),
      import("../../strategy-registry/composition/strategy-registry.factory").then((m) =>
        m.strategyRegistryFactory(strategyRegistryPolicy),
      ),
    ]);

    return {
      projection: projectionResult.useCases,
      strategyRegistry: strategyRegistryResult.useCases,
      vectorStore,
    };
  }
}
