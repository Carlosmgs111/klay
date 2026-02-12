import type {
  KnowledgeRetrievalFacadePolicy,
  ResolvedKnowledgeRetrievalModules,
} from "./infra-policies.js";
import type { SemanticQueryInfrastructurePolicy } from "../../semantic-query/composition/infra-policies.js";
import type { ConfigProvider } from "../../../shared/config/index.js";

/**
 * Composer for the Knowledge Retrieval Facade.
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
export class KnowledgeRetrievalFacadeComposer {
  // ─── Config Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves the appropriate ConfigProvider based on policy.
   * Priority: configOverrides > environment detection
   */
  private static async resolveConfig(
    policy: KnowledgeRetrievalFacadePolicy,
  ): Promise<ConfigProvider> {
    // 1. If configOverrides provided, use InMemoryConfigProvider
    if (policy.configOverrides) {
      const { InMemoryConfigProvider } = await import(
        "../../../shared/config/InMemoryConfigProvider.js"
      );
      return new InMemoryConfigProvider(policy.configOverrides);
    }

    // 2. Environment-based resolution
    switch (policy.type) {
      case "browser": {
        const { InMemoryConfigProvider } = await import(
          "../../../shared/config/InMemoryConfigProvider.js"
        );
        return new InMemoryConfigProvider({});
      }

      case "server":
      case "in-memory":
      default: {
        const { NodeConfigProvider } = await import(
          "../../../shared/config/NodeConfigProvider.js"
        );
        return new NodeConfigProvider();
      }
    }
  }

  // ─── Main Resolution ────────────────────────────────────────────────────────

  /**
   * Resolves all modules for the Knowledge Retrieval context.
   * Uses dynamic imports for tree-shaking and environment-specific loading.
   */
  static async resolve(
    policy: KnowledgeRetrievalFacadePolicy,
  ): Promise<ResolvedKnowledgeRetrievalModules> {
    const config = await this.resolveConfig(policy);

    // Build module-specific policy inheriting from facade defaults
    const semanticQueryPolicy: SemanticQueryInfrastructurePolicy = {
      type: policy.overrides?.semanticQuery?.type ?? policy.type,
      vectorStoreRef: policy.vectorStoreRef,
      embeddingDimensions:
        policy.overrides?.semanticQuery?.embeddingDimensions ??
        policy.embeddingDimensions,
      aiSdkModelId:
        policy.overrides?.semanticQuery?.aiSdkModelId ??
        policy.aiSdkModelId ??
        config.getOrDefault("KLAY_AI_SDK_MODEL", undefined),
    };

    // Resolve module via factory (returns { useCases, infra })
    const semanticQueryResult = await import(
      "../../semantic-query/composition/semantic-query.factory.js"
    ).then((m) => m.semanticQueryFactory(semanticQueryPolicy));

    return {
      semanticQuery: semanticQueryResult.useCases,
      semanticQueryInfra: semanticQueryResult.infra,
    };
  }
}
