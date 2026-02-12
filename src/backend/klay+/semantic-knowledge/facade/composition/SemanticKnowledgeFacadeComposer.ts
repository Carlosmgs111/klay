import type {
  SemanticKnowledgeFacadePolicy,
  ResolvedSemanticKnowledgeModules,
} from "./infra-policies";
import type { SemanticUnitInfrastructurePolicy } from "../../semantic-unit/composition/infra-policies";
import type { LineageInfrastructurePolicy } from "../../lineage/composition/infra-policies";
import type { ConfigProvider } from "../../../shared/config/index";

/**
 * Composer for the Semantic Knowledge Facade.
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
export class SemanticKnowledgeFacadeComposer {
  // ─── Config Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves the appropriate ConfigProvider based on policy.
   * Priority: configOverrides > environment detection
   */
  private static async resolveConfig(
    policy: SemanticKnowledgeFacadePolicy,
  ): Promise<ConfigProvider> {
    // 1. If configOverrides provided, use InMemoryConfigProvider
    if (policy.configOverrides) {
      const { InMemoryConfigProvider } = await import(
        "../../../shared/config/InMemoryConfigProvider"
      );
      return new InMemoryConfigProvider(policy.configOverrides);
    }

    // 2. Environment-based resolution
    switch (policy.type) {
      case "browser": {
        // Browser requires explicit configOverrides (import.meta.env cannot be accessed dynamically)
        const { InMemoryConfigProvider } = await import(
          "../../../shared/config/InMemoryConfigProvider"
        );
        return new InMemoryConfigProvider({});
      }

      case "server":
      case "in-memory":
      default: {
        // Server and in-memory use NodeConfigProvider (reads from process.env)
        const { NodeConfigProvider } = await import(
          "../../../shared/config/NodeConfigProvider"
        );
        return new NodeConfigProvider();
      }
    }
  }

  // ─── Main Resolution ────────────────────────────────────────────────────────

  /**
   * Resolves all modules for the Semantic Knowledge context.
   * Uses dynamic imports for tree-shaking and environment-specific loading.
   */
  static async resolve(
    policy: SemanticKnowledgeFacadePolicy,
  ): Promise<ResolvedSemanticKnowledgeModules> {
    // Resolve configuration provider first
    const config = await this.resolveConfig(policy);

    // Build module-specific policies inheriting from facade defaults
    // ConfigProvider can influence policy values when not explicitly set
    const semanticUnitPolicy: SemanticUnitInfrastructurePolicy = {
      type: policy.overrides?.semanticUnit?.type ?? policy.type,
      dbPath:
        policy.overrides?.semanticUnit?.dbPath ??
        policy.dbPath ??
        config.getOrDefault("KLAY_DB_PATH", "./data"),
      dbName:
        policy.overrides?.semanticUnit?.dbName ??
        policy.dbName ??
        config.getOrDefault("KLAY_DB_NAME", "knowledge-platform"),
    };

    const lineagePolicy: LineageInfrastructurePolicy = {
      type: policy.overrides?.lineage?.type ?? policy.type,
      dbPath:
        policy.overrides?.lineage?.dbPath ??
        policy.dbPath ??
        config.getOrDefault("KLAY_DB_PATH", "./data"),
      dbName:
        policy.overrides?.lineage?.dbName ??
        policy.dbName ??
        config.getOrDefault("KLAY_DB_NAME", "knowledge-platform"),
    };

    // Resolve modules in parallel using their factories (from composition/)
    const [semanticUnitResult, lineageResult] = await Promise.all([
      import("../../semantic-unit/composition/semantic-unit.factory").then(
        (m) => m.semanticUnitFactory(semanticUnitPolicy),
      ),
      import("../../lineage/composition/lineage.factory").then((m) =>
        m.lineageFactory(lineagePolicy),
      ),
    ]);

    return {
      semanticUnit: semanticUnitResult.useCases,
      lineage: lineageResult.useCases,
      semanticUnitRepository: semanticUnitResult.infra.repository,
      lineageRepository: lineageResult.infra.repository,
    };
  }
}
