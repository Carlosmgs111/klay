/**
 * Semantic Processing Bounded Context
 *
 * Responsible for processing extracted content into semantic projections:
 * - Chunking content into meaningful segments
 * - Generating embeddings for semantic search
 * - Storing vectors for retrieval
 */

// ═══════════════════════════════════════════════════════════════════════════
// Projection Module
// ═══════════════════════════════════════════════════════════════════════════
export {
  SemanticProjection,
  ProjectionId,
  ProjectionType,
  ProjectionStatus,
  ProjectionResult,
  ProjectionGenerated,
  ProjectionFailed,
  ProjectionUseCases,
  ProjectionComposer,
  GenerateProjection,
  projectionFactory,
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
  // Infrastructure
  BaseChunker,
  FixedSizeChunker,
  SentenceChunker,
  RecursiveChunker,
  ChunkerFactory,
  HashEmbeddingStrategy,
  WebLLMEmbeddingStrategy,
  AISdkEmbeddingStrategy,
  InMemoryVectorStore,
} from "./projection";

export type {
  SemanticProjectionRepository,
  EmbeddingStrategy,
  EmbeddingResult,
  ChunkingStrategy,
  Chunk,
  VectorStoreAdapter,
  VectorEntry,
  VectorSearchResult,
  ProjectionInfraPolicy,
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
  ProjectionFactoryResult,
  GenerateProjectionCommand,
  GenerateProjectionResult,
  ProjectionError,
} from "./projection";

// ═══════════════════════════════════════════════════════════════════════════
// Strategy Registry Module
// ═══════════════════════════════════════════════════════════════════════════
export {
  ProcessingStrategy,
  StrategyId,
  StrategyType,
  StrategyRegistryUseCases,
  StrategyRegistryComposer,
  RegisterStrategy,
  strategyRegistryFactory,
  // Domain Errors
  StrategyNotFoundError,
  StrategyAlreadyExistsError,
  StrategyNameRequiredError,
  StrategyInvalidTypeError,
  StrategyInvalidConfigurationError,
} from "./strategy-registry";

export type {
  ProcessingStrategyRepository,
  StrategyRegistryInfraPolicy,
  StrategyRegistryInfrastructurePolicy,
  ResolvedStrategyRegistryInfra,
  StrategyRegistryFactoryResult,
  RegisterStrategyCommand,
  StrategyError,
} from "./strategy-registry";

// ═══════════════════════════════════════════════════════════════════════════
// Facade (Context-Level)
// ═══════════════════════════════════════════════════════════════════════════
export {
  SemanticProcessingFacade,
  SemanticProcessingFacadeComposer,
  createSemanticProcessingFacade,
} from "./facade";

export type {
  SemanticProcessingFacadePolicy,
  SemanticProcessingInfraPolicy,
  ResolvedSemanticProcessingModules,
  ProcessContentSuccess,
  RegisterStrategySuccess,
} from "./facade";
