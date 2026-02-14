import type { QueryEmbedder } from "../domain/ports/QueryEmbedder.js";
import type { VectorReadStore } from "../domain/ports/VectorReadStore.js";
import type { RankingStrategy } from "../domain/ports/RankingStrategy.js";
import type { VectorEntry } from "../../../shared/domain/VectorEntry.js";

// ─── Policy Types ─────────────────────────────────────────────────────────────

export type SemanticQueryInfraPolicy = "in-memory" | "browser" | "server";

/**
 * Supported embedding providers for query embedding.
 * Must match the provider used in semantic-processing to ensure vector compatibility.
 * - "hash": Local deterministic hash-based embeddings (no API required)
 * - "openai": OpenAI text-embedding models (requires OPENAI_API_KEY)
 * - "cohere": Cohere embed models (requires COHERE_API_KEY)
 * - "huggingface": HuggingFace models (requires HUGGINGFACE_API_KEY)
 */
export type QueryEmbeddingProvider = "hash" | "openai" | "cohere" | "huggingface";

/**
 * Configuration for connecting to the shared vector storage resource.
 * Each environment provides the appropriate config:
 * - in-memory: sharedEntries (Map reference)
 * - browser: dbName (IndexedDB database name)
 * - server: dbPath (NeDB file path)
 */
export interface VectorStoreConfig {
  dbPath?: string;
  dbName?: string;
  sharedEntries?: Map<string, VectorEntry>;
}

export interface SemanticQueryInfrastructurePolicy {
  type: SemanticQueryInfraPolicy;
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
   * Embedding provider to use. Defaults based on policy type:
   * - "in-memory" → "hash"
   * - "browser" → uses WebLLM
   * - "server" → "hash" (fallback) or specified provider
   *
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
   * WebLLM model ID (browser only).
   */
  webLLMModelId?: string;

  // ─── Environment Configuration ────────────────────────────────────────────

  /**
   * Configuration overrides for testing or explicit configuration.
   * When provided, these values are used instead of process.env.
   *
   * Required keys depend on embeddingProvider:
   * - "openai" → OPENAI_API_KEY
   * - "cohere" → COHERE_API_KEY
   * - "huggingface" → HUGGINGFACE_API_KEY
   */
  configOverrides?: Record<string, string>;
}

// ─── Resolved Infrastructure ──────────────────────────────────────────────────

export interface ResolvedSemanticQueryInfra {
  queryEmbedder: QueryEmbedder;
  vectorSearch: VectorReadStore;
  rankingStrategy: RankingStrategy;
}
