import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { EmbeddingStrategy } from "../domain/ports/EmbeddingStrategy";
import type { ChunkingStrategy } from "../domain/ports/ChunkingStrategy";
import type { VectorStoreAdapter } from "../domain/ports/VectorStoreAdapter";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

// ─── Policy Types ────────────────────────────────────────────────────────────

export type ProjectionInfraPolicy = "in-memory" | "browser" | "server";

/**
 * Supported embedding providers.
 * - "hash": Local deterministic hash-based embeddings (no API required)
 * - "openai": OpenAI text-embedding models (requires OPENAI_API_KEY)
 * - "cohere": Cohere embed models (requires COHERE_API_KEY)
 * - "huggingface": HuggingFace models (requires HUGGINGFACE_API_KEY)
 */
export type EmbeddingProvider = "hash" | "openai" | "cohere" | "huggingface";

// ─── Infrastructure Policy ───────────────────────────────────────────────────

export interface ProjectionInfrastructurePolicy {
  type: ProjectionInfraPolicy;
  dbPath?: string;
  dbName?: string;

  // ─── Chunking Configuration ────────────────────────────────────────────────

  /** Chunking strategy ID from ChunkerFactory. Defaults to "recursive". */
  chunkingStrategyId?: string;

  // ─── Embedding Configuration ───────────────────────────────────────────────

  /** Dimensions for hash embeddings (in-memory only). Defaults to 128. */
  embeddingDimensions?: number;

  /** WebLLM model ID (browser only). */
  webLLMModelId?: string;

  /**
   * @deprecated Use `embeddingProvider` and `embeddingModel` instead.
   * Pre-configured AI SDK embedding model (server only).
   */
  aiSdkEmbeddingModel?: any;

  /**
   * Embedding provider to use. Defaults based on policy type:
   * - "in-memory" → "hash"
   * - "browser" → uses WebLLM
   * - "server" → "hash" (fallback) or specified provider
   */
  embeddingProvider?: EmbeddingProvider;

  /**
   * Model ID for the embedding provider.
   * @example "text-embedding-3-small" (OpenAI)
   * @example "embed-multilingual-v3.0" (Cohere)
   * @example "sentence-transformers/all-MiniLM-L6-v2" (HuggingFace)
   */
  embeddingModel?: string;

  // ─── Vector Store Configuration ────────────────────────────────────────────

  /**
   * Shared vector store for cross-context wiring.
   * If provided, this store is used instead of creating a new one.
   * This enables the orchestrator to expose a single store for retrieval queries.
   */
  sharedVectorStore?: VectorStoreAdapter;

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

export interface ResolvedProjectionInfra {
  repository: SemanticProjectionRepository;
  embeddingStrategy: EmbeddingStrategy;
  chunkingStrategy: ChunkingStrategy;
  vectorStore: VectorStoreAdapter;
  eventPublisher: EventPublisher;
}
