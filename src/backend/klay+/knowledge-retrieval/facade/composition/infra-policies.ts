import type { SemanticQueryInfrastructurePolicy } from "../../semantic-query/composition/infra-policies.js";
import type { SemanticQueryUseCases } from "../../semantic-query/application/index.js";
import type { ResolvedSemanticQueryInfra } from "../../semantic-query/composition/infra-policies.js";
import type { VectorStoreAdapter } from "../../../semantic-processing/projection/domain/ports/VectorStoreAdapter.js";

// ─── Facade Policy ───────────────────────────────────────────────────────────

export type KnowledgeRetrievalInfraPolicy = "in-memory" | "browser" | "server";

export interface KnowledgeRetrievalFacadePolicy {
  type: KnowledgeRetrievalInfraPolicy;
  /**
   * Reference to the vector store from the semantic-processing context.
   * Required for cross-context wiring - retrieval reads from processing's vectors.
   */
  vectorStoreRef: VectorStoreAdapter;
  /**
   * Embedding dimensions - must match the embedding strategy used in processing.
   * @default 128
   */
  embeddingDimensions?: number;
  /**
   * AI SDK model ID for server-side embeddings.
   * @example "openai:text-embedding-3-small"
   */
  aiSdkModelId?: string;
  /**
   * Override policies for individual modules.
   * If not provided, modules inherit from the facade's type.
   */
  overrides?: {
    semanticQuery?: Partial<Omit<SemanticQueryInfrastructurePolicy, "vectorStoreRef">>;
  };
  /**
   * Configuration overrides for testing or explicit configuration.
   * When provided, these values take precedence over environment variables.
   *
   * @example
   * ```typescript
   * configOverrides: {
   *   KLAY_AI_SDK_MODEL: "openai:text-embedding-3-small",
   * }
   * ```
   */
  configOverrides?: Record<string, string>;
}

// ─── Resolved Modules ────────────────────────────────────────────────────────

export interface ResolvedKnowledgeRetrievalModules {
  semanticQuery: SemanticQueryUseCases;
  /** Infrastructure exposed for facade coordination */
  semanticQueryInfra: ResolvedSemanticQueryInfra;
}
