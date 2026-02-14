import type {
  ProjectionInfrastructurePolicy,
  EmbeddingProvider,
} from "../../projection/composition/index";
import type { StrategyRegistryInfrastructurePolicy } from "../../strategy-registry/composition/index";
import type { ProjectionUseCases } from "../../projection/application/index";
import type { StrategyRegistryUseCases } from "../../strategy-registry/application/index";
import type { VectorEntry } from "../../../shared/domain/VectorEntry";

// Re-export for convenience
export type { EmbeddingProvider } from "../../projection/composition/index";

// ─── Vector Store Config ────────────────────────────────────────────────────

/**
 * Configuration exposed for cross-context wiring.
 * Instead of sharing a VectorStore instance, we share the config
 * so each context can create its own store pointing to the same resource.
 */
export interface VectorStoreConfig {
  dbPath?: string;
  dbName?: string;
  sharedEntries?: Map<string, VectorEntry>;
}

// ─── Facade Policy ──────────────────────────────────────────────────────────

export type SemanticProcessingInfraPolicy = "in-memory" | "browser" | "server";

export interface SemanticProcessingFacadePolicy {
  type: SemanticProcessingInfraPolicy;

  // ─── Database Configuration ────────────────────────────────────────────────

  /**
   * Database path for server-side persistence (NeDB).
   * @default "./data"
   */
  dbPath?: string;
  /**
   * Database name for browser-side persistence (IndexedDB).
   * @default "semantic-processing"
   */
  dbName?: string;

  // ─── Embedding Configuration ───────────────────────────────────────────────

  /**
   * Embedding dimensions for vector generation (hash embeddings only).
   * @default 128
   */
  embeddingDimensions?: number;

  /**
   * @deprecated Use `embeddingProvider` and `embeddingModel` instead.
   * AI SDK model ID for server-side embeddings.
   */
  aiSdkModelId?: string;

  /**
   * Embedding provider to use.
   * - "hash": Local deterministic embeddings (no API required)
   * - "openai": OpenAI text-embedding models (requires OPENAI_API_KEY)
   * - "cohere": Cohere embed models (requires COHERE_API_KEY)
   * - "huggingface": HuggingFace models (requires HUGGINGFACE_API_KEY)
   *
   * @default "hash" for in-memory, auto-detected for server
   */
  embeddingProvider?: EmbeddingProvider;

  /**
   * Model ID for the embedding provider.
   * @example "text-embedding-3-small" (OpenAI)
   * @example "embed-multilingual-v3.0" (Cohere)
   * @example "sentence-transformers/all-MiniLM-L6-v2" (HuggingFace)
   */
  embeddingModel?: string;

  // ─── Chunking Configuration ────────────────────────────────────────────────

  /**
   * Default chunking strategy type.
   * @default "recursive"
   */
  defaultChunkingStrategy?: "fixed-size" | "sentence" | "recursive";

  // ─── Module Overrides ──────────────────────────────────────────────────────

  /**
   * Override policies for individual modules.
   * If not provided, modules inherit from the facade's type.
   */
  overrides?: {
    projection?: Partial<ProjectionInfrastructurePolicy>;
    strategyRegistry?: Partial<StrategyRegistryInfrastructurePolicy>;
  };

  // ─── Environment Configuration ─────────────────────────────────────────────

  /**
   * Configuration overrides for testing or explicit configuration.
   * When provided, these values take precedence over environment variables.
   *
   * @example
   * ```typescript
   * configOverrides: {
   *   OPENAI_API_KEY: "sk-...",
   *   COHERE_API_KEY: "...",
   * }
   * ```
   */
  configOverrides?: Record<string, string>;
}

// ─── Resolved Modules ───────────────────────────────────────────────────────

export interface ResolvedSemanticProcessingModules {
  projection: ProjectionUseCases;
  strategyRegistry: StrategyRegistryUseCases;
  /**
   * Configuration for cross-context vector store wiring.
   * Each context creates its own VectorReadStore/VectorWriteStore
   * pointing to the same physical resource via this config.
   */
  vectorStoreConfig: VectorStoreConfig;
}
