import type {
  SemanticProcessingFacadePolicy,
  ResolvedSemanticProcessingModules,
} from "./infra-policies";
import type { ProjectionInfrastructurePolicy } from "../../projection/composition/index";
import type { StrategyRegistryInfrastructurePolicy } from "../../strategy-registry/composition/index";
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

  // ─── Main Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves all modules for the Semantic Processing context.
   * Uses dynamic imports for tree-shaking and environment-specific loading.
   *
   * Vector store resolution is fully delegated to ProjectionComposer,
   * which selects the correct implementation (InMemory, NeDB, IndexedDB)
   * based on the policy type. The resolved store is then exposed for
   * cross-context wiring (e.g., knowledge-retrieval needs it for queries).
   */
  static async resolve(
    policy: SemanticProcessingFacadePolicy
  ): Promise<ResolvedSemanticProcessingModules> {
    // Resolve configuration provider first
    const config = await this.resolveConfig(policy);

    // Build module-specific policies inheriting from facade defaults
    // ConfigProvider can influence policy values when not explicitly set
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

      // ─── Embedding Provider Configuration ─────────────────────────────────────
      embeddingProvider:
        policy.overrides?.projection?.embeddingProvider ??
        policy.embeddingProvider,
      embeddingModel:
        policy.overrides?.projection?.embeddingModel ??
        policy.embeddingModel,

      // @deprecated - kept for backwards compatibility
      aiSdkEmbeddingModel: policy.aiSdkModelId,

      // ─── Environment Configuration ─────────────────────────────────────────────
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
      // Expose the vector store resolved by ProjectionComposer
      // for cross-context wiring (knowledge-retrieval needs this)
      vectorStore: projectionResult.infra.vectorStore,
    };
  }
}
