import type {
  SemanticQueryInfrastructurePolicy,
  QueryEmbeddingProvider,
  VectorStoreConfig,
} from "../../semantic-query/composition/infra-policies.js";
import type { SemanticQueryUseCases } from "../../semantic-query/application/index.js";
import type { ResolvedSemanticQueryInfra } from "../../semantic-query/composition/infra-policies.js";

// ─── Facade Policy ───────────────────────────────────────────────────────────

export type KnowledgeRetrievalInfraPolicy = "in-memory" | "browser" | "server";

export interface KnowledgeRetrievalFacadePolicy {
  type: KnowledgeRetrievalInfraPolicy;
  /**
   * Configuration for connecting to the vector store resource.
   * Replaces direct vectorStoreRef to eliminate cross-context coupling.
   */
  vectorStoreConfig: VectorStoreConfig;
  /**
   * Embedding dimensions - must match the embedding strategy used in processing.
   * @default 128
   */
  embeddingDimensions?: number;

  // ─── Embedding Configuration ──────────────────────────────────────────────

  /**
   * Embedding provider to use.
   * Must match the provider used in semantic-processing for vector compatibility.
   */
  embeddingProvider?: QueryEmbeddingProvider;

  /**
   * Model ID for the embedding provider.
   * @example "text-embedding-3-small" (OpenAI)
   * @example "embed-multilingual-v3.0" (Cohere)
   * @example "sentence-transformers/all-MiniLM-L6-v2" (HuggingFace)
   */
  embeddingModel?: string;

  /**
   * Override policies for individual modules.
   * If not provided, modules inherit from the facade's type.
   */
  overrides?: {
    semanticQuery?: Partial<Omit<SemanticQueryInfrastructurePolicy, "vectorStoreConfig">>;
  };
  /**
   * Configuration overrides for testing or explicit configuration.
   * When provided, these values take precedence over environment variables.
   *
   * Required keys depend on embeddingProvider:
   * - "openai" → OPENAI_API_KEY
   * - "cohere" → COHERE_API_KEY
   * - "huggingface" → HUGGINGFACE_API_KEY
   */
  configOverrides?: Record<string, string>;
}

// ─── Resolved Modules ────────────────────────────────────────────────────────

export interface ResolvedKnowledgeRetrievalModules {
  semanticQuery: SemanticQueryUseCases;
  /** Infrastructure exposed for facade coordination */
  semanticQueryInfra: ResolvedSemanticQueryInfra;
}
