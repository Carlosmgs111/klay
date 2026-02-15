/**
 * Projection Module - Public API
 *
 * This module manages semantic projections (chunking, embedding, vector storage).
 * It transforms content into searchable vector representations.
 */

// ─── Domain ─────────────────────────────────────────────────────────────────
export {
  SemanticProjection,
  ProjectionId,
  ProjectionType,
  ProjectionStatus,
  ProjectionResult,
  ProjectionGenerated,
  ProjectionFailed,
  // Domain Errors
  ProjectionNotFoundError,
  ProjectionAlreadyExistsError,
  ProjectionSemanticUnitIdRequiredError,
  ProjectionContentRequiredError,
  ProjectionInvalidTypeError,
  ProjectionInvalidStateError,
  ProjectionCannotProcessError,
  ProjectionCannotCompleteError,
  ProjectionCannotFailError,
  ChunkingFailedError,
  EmbeddingFailedError,
  VectorStoreFailedError,
  ProjectionProcessingError,
} from "./domain/index";

export type {
  SemanticProjectionRepository,
  EmbeddingStrategy,
  EmbeddingResult,
  ChunkingStrategy,
  Chunk,
  VectorWriteStore,
  VectorEntry,
  ProjectionError,
} from "./domain/index";

// ─── Application ────────────────────────────────────────────────────────────
export { GenerateProjection, ProjectionUseCases } from "./application/index";
export type {
  GenerateProjectionCommand,
  GenerateProjectionResult,
} from "./application/index";

// ─── Infrastructure (strategies & adapters) ─────────────────────────────────
export {
  BaseChunker,
  FixedSizeChunker,
  SentenceChunker,
  RecursiveChunker,
  ChunkerFactory,
  HashEmbeddingStrategy,
  WebLLMEmbeddingStrategy,
  AISdkEmbeddingStrategy,
} from "./infrastructure/strategies/index";

export { InMemoryVectorWriteStore } from "./infrastructure/adapters/InMemoryVectorWriteStore";

// ─── Composition & Factory ──────────────────────────────────────────────────
export {
  ProjectionComposer,
  projectionFactory,
  ProcessingProfileMaterializer,
} from "./composition/index";
export type {
  ProjectionInfraPolicy,
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
  ProjectionFactoryResult,
  MaterializedStrategies,
} from "./composition/index";
