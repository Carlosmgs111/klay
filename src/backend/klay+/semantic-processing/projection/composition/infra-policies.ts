import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { EmbeddingStrategy } from "../domain/ports/EmbeddingStrategy";
import type { ChunkingStrategy } from "../domain/ports/ChunkingStrategy";
import type { VectorStoreAdapter } from "../domain/ports/VectorStoreAdapter";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

export type ProjectionInfraPolicy = "in-memory" | "browser" | "server";

export interface ProjectionInfrastructurePolicy {
  type: ProjectionInfraPolicy;
  dbPath?: string;
  dbName?: string;

  /** Chunking strategy ID from ChunkerFactory. Defaults to "recursive". */
  chunkingStrategyId?: string;
  /** Dimensions for hash embeddings (in-memory only). Defaults to 128. */
  embeddingDimensions?: number;
  /** WebLLM model ID (browser only). */
  webLLMModelId?: string;
  /** Pre-configured AI SDK embedding model (server only). */
  aiSdkEmbeddingModel?: any;
  /**
   * Shared vector store for cross-context wiring.
   * If provided, this store is used instead of creating a new one.
   * This enables the orchestrator to expose a single store for retrieval queries.
   */
  sharedVectorStore?: VectorStoreAdapter;
}

export interface ResolvedProjectionInfra {
  repository: SemanticProjectionRepository;
  embeddingStrategy: EmbeddingStrategy;
  chunkingStrategy: ChunkingStrategy;
  vectorStore: VectorStoreAdapter;
  eventPublisher: EventPublisher;
}
