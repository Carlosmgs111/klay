import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { EmbeddingStrategy } from "../domain/ports/EmbeddingStrategy";
import type { ChunkingStrategy } from "../domain/ports/ChunkingStrategy";
import type { VectorWriteStore } from "../domain/ports/VectorWriteStore";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

// ─── Use Cases ─────────────────────────────────────────────────────
export { GenerateProjection } from "./GenerateProjection";
export type {
  GenerateProjectionCommand,
  GenerateProjectionResult,
} from "./GenerateProjection";

// ─── Use Cases Facade ──────────────────────────────────────────────
import { GenerateProjection } from "./GenerateProjection";

export class ProjectionUseCases {
  readonly generateProjection: GenerateProjection;

  constructor(
    repository: SemanticProjectionRepository,
    embeddingStrategy: EmbeddingStrategy,
    chunkingStrategy: ChunkingStrategy,
    vectorStore: VectorWriteStore,
    eventPublisher: EventPublisher,
  ) {
    this.generateProjection = new GenerateProjection(
      repository,
      embeddingStrategy,
      chunkingStrategy,
      vectorStore,
      eventPublisher,
    );
  }
}
