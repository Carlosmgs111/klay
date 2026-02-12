import type {
  SourceIngestionFacadePolicy,
  ResolvedSourceIngestionModules,
} from "./infra-policies";
import type { SourceInfrastructurePolicy } from "../../source/composition/index";
import type { ExtractionInfrastructurePolicy } from "../../extraction/composition/index";
import type { ConfigProvider } from "../../../shared/config/index";

/**
 * Composer for the Source Ingestion Facade.
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
export class SourceIngestionFacadeComposer {
  // ─── Config Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves the appropriate ConfigProvider based on policy.
   * Priority: configOverrides > environment detection
   */
  private static async resolveConfig(
    policy: SourceIngestionFacadePolicy,
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
   * Resolves all modules for the Source Ingestion context.
   * Uses dynamic imports for tree-shaking and environment-specific loading.
   */
  static async resolve(
    policy: SourceIngestionFacadePolicy,
  ): Promise<ResolvedSourceIngestionModules> {
    // Resolve configuration provider first
    const config = await this.resolveConfig(policy);

    // Build module-specific policies inheriting from facade defaults
    // ConfigProvider can influence policy values when not explicitly set
    const sourcePolicy: SourceInfrastructurePolicy = {
      type: policy.overrides?.source?.type ?? policy.type,
      dbPath: policy.overrides?.source?.dbPath ??
              policy.dbPath ??
              config.getOrDefault("KLAY_DB_PATH", "./data"),
      dbName: policy.overrides?.source?.dbName ??
              policy.dbName ??
              config.getOrDefault("KLAY_DB_NAME", "knowledge-platform"),
    };

    const extractionPolicy: ExtractionInfrastructurePolicy = {
      type: policy.overrides?.extraction?.type ?? policy.type,
      dbPath: policy.overrides?.extraction?.dbPath ??
              policy.dbPath ??
              config.getOrDefault("KLAY_DB_PATH", "./data"),
      dbName: policy.overrides?.extraction?.dbName ??
              policy.dbName ??
              config.getOrDefault("KLAY_DB_NAME", "knowledge-platform"),
    };

    // Resolve modules in parallel using their factories (from composition/)
    const [sourceResult, extractionResult] = await Promise.all([
      import("../../source/composition/source.factory").then((m) =>
        m.sourceFactory(sourcePolicy),
      ),
      import("../../extraction/composition/extraction.factory").then((m) =>
        m.extractionFactory(extractionPolicy),
      ),
    ]);

    return {
      source: sourceResult.useCases,
      extraction: extractionResult.useCases,
      sourceRepository: sourceResult.infra.repository,
    };
  }
}
