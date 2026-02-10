export { SemanticProjection } from "./SemanticProjection";
export { ProjectionId } from "./ProjectionId";
export { ProjectionType } from "./ProjectionType";
export { ProjectionStatus } from "./ProjectionStatus";
export { ProjectionResult } from "./ProjectionResult";
export type { SemanticProjectionRepository } from "./SemanticProjectionRepository";

export type {
  EmbeddingStrategy,
  EmbeddingResult,
  ChunkingStrategy,
  Chunk,
  VectorStoreAdapter,
  VectorEntry,
  VectorSearchResult,
} from "./ports/index";

export { ProjectionGenerated } from "./events/ProjectionGenerated";
export { ProjectionFailed } from "./events/ProjectionFailed";

// Domain Errors
export {
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
  type ProjectionError,
} from "./errors";
