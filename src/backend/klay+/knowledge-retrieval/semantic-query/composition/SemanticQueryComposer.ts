import type {
  SemanticQueryInfrastructurePolicy,
  ResolvedSemanticQueryInfra,
} from "./infra-policies.js";
import type { QueryEmbedder } from "../domain/ports/QueryEmbedder.js";
import type { ConfigProvider } from "../../../shared/config/index.js";

/**
 * Composer for the Semantic Query Module.
 *
 * Responsible for resolving infrastructure dependencies based on policy.
 * Each aspect (embedder, vector search, ranking) has its own resolver method.
 *
 * Mirrors the resolution pattern from ProjectionComposer in semantic-processing
 * to ensure consistent AI provider handling across contexts.
 */
export class SemanticQueryComposer {
  // ─── Config Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves the appropriate ConfigProvider based on policy.
   * Priority: configOverrides > process.env (NodeConfigProvider)
   */
  private static async resolveConfigProvider(
    policy: SemanticQueryInfrastructurePolicy,
  ): Promise<ConfigProvider> {
    if (policy.configOverrides) {
      const { InMemoryConfigProvider } = await import(
        "../../../shared/config/InMemoryConfigProvider.js"
      );
      return new InMemoryConfigProvider(policy.configOverrides);
    }
    const { NodeConfigProvider } = await import(
      "../../../shared/config/NodeConfigProvider.js"
    );
    return new NodeConfigProvider();
  }

  // ─── Query Embedder Resolution ──────────────────────────────────────────────

  /**
   * Resolves the query embedder based on policy configuration.
   *
   * Priority:
   * 1. If embeddingProvider is set (not "hash") → resolveAIQueryEmbedder()
   * 2. If aiSdkEmbeddingModel provided (deprecated) → use it directly
   * 3. If browser policy → WebLLMQueryEmbedder
   * 4. Default → HashQueryEmbedder
   */
  private static async resolveQueryEmbedder(
    policy: SemanticQueryInfrastructurePolicy,
  ): Promise<QueryEmbedder> {
    const dimensions = policy.embeddingDimensions ?? 128;

    // 1. If explicit embeddingProvider is set (and not "hash"), use AI SDK
    if (policy.embeddingProvider && policy.embeddingProvider !== "hash") {
      return this.resolveAIQueryEmbedder(policy);
    }

    // 2. Fallback legacy: aiSdkEmbeddingModel pre-configured (deprecated)
    if (policy.aiSdkEmbeddingModel) {
      const { AISdkQueryEmbedder } = await import(
        "../infrastructure/adapters/AISdkQueryEmbedder.js"
      );
      return new AISdkQueryEmbedder(policy.aiSdkEmbeddingModel);
    }

    // 3. Browser uses WebLLM
    if (policy.type === "browser") {
      const { WebLLMQueryEmbedder } = await import(
        "../infrastructure/adapters/WebLLMQueryEmbedder.js"
      );
      const embedder = new WebLLMQueryEmbedder(policy.webLLMModelId);
      await embedder.initialize();
      return embedder;
    }

    // 4. Default: hash embeddings (in-memory, server without provider)
    const { HashQueryEmbedder } = await import(
      "../infrastructure/adapters/HashQueryEmbedder.js"
    );
    return new HashQueryEmbedder(dimensions);
  }

  // ─── AI Query Embedder Resolution ───────────────────────────────────────────

  /**
   * Resolves an AI SDK query embedder based on the configured provider.
   * Automatically creates the model with API key from ConfigProvider.
   *
   * Mirrors ProjectionComposer.resolveAIEmbeddingStrategy() to ensure
   * the same model objects are created for vector compatibility.
   */
  private static async resolveAIQueryEmbedder(
    policy: SemanticQueryInfrastructurePolicy,
  ): Promise<QueryEmbedder> {
    const config = await this.resolveConfigProvider(policy);
    const provider = policy.embeddingProvider!;

    const { AISdkQueryEmbedder } = await import(
      "../infrastructure/adapters/AISdkQueryEmbedder.js"
    );

    switch (provider) {
      case "openai": {
        const apiKey = config.require("OPENAI_API_KEY");
        const modelId = policy.embeddingModel ?? "text-embedding-3-small";
        const { createOpenAI } = await import("@ai-sdk/openai");
        const openai = createOpenAI({ apiKey });
        const model = openai.embedding(modelId);
        return new AISdkQueryEmbedder(model);
      }

      case "cohere": {
        const apiKey = config.require("COHERE_API_KEY");
        const modelId = policy.embeddingModel ?? "embed-multilingual-v3.0";
        const { createCohere } = await import("@ai-sdk/cohere");
        const cohere = createCohere({ apiKey });
        const model = cohere.textEmbeddingModel(modelId);
        return new AISdkQueryEmbedder(model);
      }

      case "huggingface": {
        const apiKey = config.require("HUGGINGFACE_API_KEY");
        const modelId =
          policy.embeddingModel ?? "sentence-transformers/all-MiniLM-L6-v2";
        const { createHuggingFace } = await import("@ai-sdk/huggingface");
        const hf = createHuggingFace({ apiKey });
        const model = hf.textEmbeddingModel(modelId);
        return new AISdkQueryEmbedder(model);
      }

      default:
        throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }

  // ─── Main Resolution ────────────────────────────────────────────────────────

  static async resolve(
    policy: SemanticQueryInfrastructurePolicy,
  ): Promise<ResolvedSemanticQueryInfra> {
    const { InMemoryVectorSearchAdapter } = await import(
      "../infrastructure/adapters/InMemoryVectorSearchAdapter.js"
    );
    const { PassthroughRankingStrategy } = await import(
      "../infrastructure/adapters/PassthroughRankingStrategy.js"
    );

    const queryEmbedder = await this.resolveQueryEmbedder(policy);

    return {
      queryEmbedder,
      vectorSearch: new InMemoryVectorSearchAdapter(policy.vectorStoreRef),
      rankingStrategy: new PassthroughRankingStrategy(),
    };
  }
}
