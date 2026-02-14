import type {
  SemanticProcessingFacadePolicy,
  ResolvedSemanticProcessingModules,
  VectorStoreConfig,
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
   * which creates a VectorWriteStore. The resolved vectorStoreConfig
   * is exposed for cross-context wiring (knowledge-retrieval creates
   * its own VectorReadStore from this config).
   */
  static async resolve(
    policy: SemanticProcessingFacadePolicy
  ): Promise<ResolvedSemanticProcessingModules> {
    // Resolve configuration provider first
    const config = await this.resolveConfig(policy);

    // Resolve dbPath and dbName from config
    const resolvedDbPath =
      policy.dbPath ?? config.getOrDefault("KLAY_DB_PATH", "./data");
    const resolvedDbName =
      policy.dbName ?? config.getOrDefault("KLAY_DB_NAME", "semantic-processing");

    // Build module-specific policies inheriting from facade defaults
    // ConfigProvider can influence policy values when not explicitly set
    const projectionPolicy: ProjectionInfrastructurePolicy = {
      type: policy.overrides?.projection?.type ?? policy.type,
      dbPath:
        policy.overrides?.projection?.dbPath ?? resolvedDbPath,
      dbName:
        policy.overrides?.projection?.dbName ?? resolvedDbName,
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

      // ─── Environment Configuration ─────────────────────────────────────────────
      configOverrides: policy.configOverrides,
    };

    const strategyRegistryPolicy: StrategyRegistryInfrastructurePolicy = {
      type: policy.overrides?.strategyRegistry?.type ?? policy.type,
      dbPath:
        policy.overrides?.strategyRegistry?.dbPath ?? resolvedDbPath,
      dbName:
        policy.overrides?.strategyRegistry?.dbName ?? resolvedDbName,
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

    // Build vectorStoreConfig for cross-context wiring
    const vectorStoreConfig: VectorStoreConfig = {
      dbPath: projectionPolicy.dbPath
        ? `${projectionPolicy.dbPath}/vector-entries.db`
        : undefined,
      dbName: projectionPolicy.dbName,
    };

    // For in-memory, expose the sharedEntries Map from the write store
    if (policy.type === "in-memory") {
      const writeStore = projectionResult.infra.vectorWriteStore as any;
      if (writeStore.sharedEntries) {
        vectorStoreConfig.sharedEntries = writeStore.sharedEntries;
      }
    }

    return {
      projection: projectionResult.useCases,
      strategyRegistry: strategyRegistryResult.useCases,
      vectorStoreConfig,
    };
  }
}
