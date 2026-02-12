import type {
  SemanticProcessingFacadePolicy,
  ResolvedSemanticProcessingModules,
} from "./infra-policies";
import type { ProjectionInfrastructurePolicy } from "../../projection/composition/index";
import type { StrategyRegistryInfrastructurePolicy } from "../../strategy-registry/composition/index";
import type { VectorStoreAdapter } from "../../projection/domain/ports/VectorStoreAdapter";
import type { ConfigProvider } from "../../../shared/config/index";

/**
 * Composer for the Semantic Processing Facade.
 *
 * This is a COMPOSITION component - it only:
 * - Selects infrastructure implementations based on policy
 * - Resolves configuration based on environment
 * - Instantiates modules via their factories
 * - Wires dependencies for the facade
 *
 * It does NOT contain:
 * - Business logic
 * - Domain rules
 * - Application flows
 */
export class SemanticProcessingFacadeComposer {
  // ─── Config Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves the appropriate ConfigProvider based on policy.
   * Priority: configOverrides > environment detection
   */
  private static async resolveConfig(
    policy: SemanticProcessingFacadePolicy
  ): Promise<ConfigProvider> {
    // 1. If configOverrides provided, use InMemoryConfigProvider
    if (policy.configOverrides) {
      const { InMemoryConfigProvider } =
        await import("../../../shared/config/InMemoryConfigProvider");
      return new InMemoryConfigProvider(policy.configOverrides);
    }

    // 2. Environment-based resolution
    switch (policy.type) {
      case "browser": {
        // Browser requires explicit configOverrides (import.meta.env cannot be accessed dynamically)
        const { InMemoryConfigProvider } =
          await import("../../../shared/config/InMemoryConfigProvider");
        return new InMemoryConfigProvider({});
      }

      case "server":
      case "in-memory":
      default: {
        // Server and in-memory use NodeConfigProvider (reads from process.env)
        const { NodeConfigProvider } =
          await import("../../../shared/config/NodeConfigProvider");
        return new NodeConfigProvider();
      }
    }
  }

  // ─── Vector Store Resolution ──────────────────────────────────────────────

  private static async resolveVectorStore(
    _policy: SemanticProcessingFacadePolicy
  ): Promise<VectorStoreAdapter> {
    // For all environments, we use InMemoryVectorStore
    // In production, this could be replaced with Pinecone, Weaviate, etc.
    const { InMemoryVectorStore } =
      await import("../../projection/infrastructure/adapters/InMemoryVectorStore");
    return new InMemoryVectorStore();
  }

  // ─── Main Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves all modules for the Semantic Processing context.
   * Uses dynamic imports for tree-shaking and environment-specific loading.
   */
  static async resolve(
    policy: SemanticProcessingFacadePolicy
  ): Promise<ResolvedSemanticProcessingModules> {
    // Resolve configuration provider first
    const config = await this.resolveConfig(policy);

    // Create a shared vector store that will be exposed to other contexts
    const vectorStore = await this.resolveVectorStore(policy);

    // Build module-specific policies inheriting from facade defaults
    // ConfigProvider can influence policy values when not explicitly set
    // Pass the shared vector store so projection module uses the same instance
    const projectionPolicy: ProjectionInfrastructurePolicy = {
      type: policy.overrides?.projection?.type ?? policy.type,
      dbPath:
        policy.overrides?.projection?.dbPath ??
        policy.dbPath ??
        config.getOrDefault("KLAY_DB_PATH", "./data"),
      dbName:
        policy.overrides?.projection?.dbName ??
        policy.dbName ??
        config.getOrDefault("KLAY_DB_NAME", "semantic-processing"),
      embeddingDimensions:
        policy.overrides?.projection?.embeddingDimensions ??
        policy.embeddingDimensions,
      chunkingStrategyId:
        policy.overrides?.projection?.chunkingStrategyId ??
        policy.defaultChunkingStrategy,
      sharedVectorStore: vectorStore, // Wire shared store for cross-context queries

      // ─── Embedding Provider Configuration ─────────────────────────────────────
      // New fields for provider selection (preferred over deprecated aiSdkEmbeddingModel)
      embeddingProvider:
        policy.overrides?.projection?.embeddingProvider ??
        policy.embeddingProvider,
      embeddingModel:
        policy.overrides?.projection?.embeddingModel ??
        policy.embeddingModel,

      // @deprecated - kept for backwards compatibility
      aiSdkEmbeddingModel: policy.aiSdkModelId,

      // ─── Environment Configuration ─────────────────────────────────────────────
      // Pass configOverrides to ProjectionComposer for API key resolution
      configOverrides: policy.configOverrides,
    };

    const strategyRegistryPolicy: StrategyRegistryInfrastructurePolicy = {
      type: policy.overrides?.strategyRegistry?.type ?? policy.type,
      dbPath:
        policy.overrides?.strategyRegistry?.dbPath ??
        policy.dbPath ??
        config.getOrDefault("KLAY_DB_PATH", "./data"),
      dbName:
        policy.overrides?.strategyRegistry?.dbName ??
        policy.dbName ??
        config.getOrDefault("KLAY_DB_NAME", "semantic-processing"),
    };

    // Resolve modules in parallel using their factories (from composition/)
    // Factories return { useCases, infra } - we extract useCases for the facade
    const [projectionResult, strategyRegistryResult] = await Promise.all([
      import("../../projection/composition/projection.factory").then((m) =>
        m.projectionFactory(projectionPolicy)
      ),
      import("../../strategy-registry/composition/strategy-registry.factory").then(
        (m) => m.strategyRegistryFactory(strategyRegistryPolicy)
      ),
    ]);

    return {
      projection: projectionResult.useCases,
      strategyRegistry: strategyRegistryResult.useCases,
      vectorStore,
    };
  }
}
