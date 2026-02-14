import type { EventPublisher } from "../../../shared/domain/index";
import { Result } from "../../../shared/domain/Result";
import { SemanticProjection } from "../domain/SemanticProjection";
import { ProjectionId } from "../domain/ProjectionId";
import { ProjectionResult } from "../domain/ProjectionResult";
import type { ProjectionType } from "../domain/ProjectionType";
import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { EmbeddingStrategy } from "../domain/ports/EmbeddingStrategy";
import type { ChunkingStrategy } from "../domain/ports/ChunkingStrategy";
import type { VectorWriteStore } from "../domain/ports/VectorWriteStore";
import type { VectorEntry } from "../../../shared/domain/VectorEntry";
import {
  ProjectionSemanticUnitIdRequiredError,
  ProjectionContentRequiredError,
  ProjectionProcessingError,
  type ProjectionError,
} from "../domain/errors";

export interface GenerateProjectionCommand {
  projectionId: string;
  semanticUnitId: string;
  semanticUnitVersion: number;
  content: string;
  type: ProjectionType;
}

export interface GenerateProjectionResult {
  projectionId: string;
  chunksCount: number;
  dimensions: number;
  model: string;
}

export class GenerateProjection {
  constructor(
    private readonly repository: SemanticProjectionRepository,
    private readonly embeddingStrategy: EmbeddingStrategy,
    private readonly chunkingStrategy: ChunkingStrategy,
    private readonly vectorStore: VectorWriteStore,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: GenerateProjectionCommand,
  ): Promise<Result<ProjectionError, GenerateProjectionResult>> {
    // ─── Validations ────────────────────────────────────────────────────
    if (!command.semanticUnitId || command.semanticUnitId.trim() === "") {
      return Result.fail(new ProjectionSemanticUnitIdRequiredError());
    }

    if (!command.content || command.content.trim() === "") {
      return Result.fail(new ProjectionContentRequiredError());
    }

    // ─── Create Projection ──────────────────────────────────────────────
    const projectionId = ProjectionId.create(command.projectionId);

    const projection = SemanticProjection.create(
      projectionId,
      command.semanticUnitId,
      command.semanticUnitVersion,
      command.type,
    );

    projection.markProcessing();

    try {
      // ─── Chunking ───────────────────────────────────────────────────────
      const chunks = this.chunkingStrategy.chunk(command.content);
      const chunkContents = chunks.map((c) => c.content);

      // ─── Embedding ──────────────────────────────────────────────────────
      const embeddings = await this.embeddingStrategy.embedBatch(chunkContents);

      // ─── Vector Store ───────────────────────────────────────────────────
      const vectorEntries: VectorEntry[] = chunks.map((chunk, i) => ({
        id: `${command.semanticUnitId}-${command.semanticUnitVersion}-${chunk.index}`,
        semanticUnitId: command.semanticUnitId,
        vector: embeddings[i].vector,
        content: chunk.content,
        metadata: {
          version: command.semanticUnitVersion,
          chunkIndex: chunk.index,
          model: embeddings[i].model,
          ...chunk.metadata,
        },
      }));

      await this.vectorStore.deleteBySemanticUnitId(command.semanticUnitId);
      await this.vectorStore.upsert(vectorEntries);

      // ─── Complete Projection ────────────────────────────────────────────
      const result = ProjectionResult.create(
        command.type,
        {
          chunksCount: chunks.length,
          dimensions: embeddings[0]?.dimensions ?? 0,
          model: embeddings[0]?.model ?? "unknown",
        },
        this.embeddingStrategy.strategyId,
        this.embeddingStrategy.version,
      );

      projection.complete(result);

      // ─── Persist and Publish ────────────────────────────────────────────
      await this.repository.save(projection);
      await this.eventPublisher.publishAll(projection.clearEvents());

      return Result.ok({
        projectionId: command.projectionId,
        chunksCount: chunks.length,
        dimensions: embeddings[0]?.dimensions ?? 0,
        model: embeddings[0]?.model ?? "unknown",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Determine the phase where error occurred
      const phase = this.determineErrorPhase(error);

      projection.fail(message);

      await this.repository.save(projection);
      await this.eventPublisher.publishAll(projection.clearEvents());

      return Result.fail(
        new ProjectionProcessingError(
          command.semanticUnitId,
          message,
          phase,
          error instanceof Error ? error : undefined,
        ),
      );
    }
  }

  private determineErrorPhase(error: unknown): "chunking" | "embedding" | "storage" {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("chunk")) return "chunking";
    if (message.includes("embed") || message.includes("vector")) return "embedding";
    if (message.includes("store") || message.includes("database")) return "storage";

    return "embedding"; // Default to embedding as most common
  }
}
