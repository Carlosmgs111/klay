import type { SourceIngestionFacade } from "../../../../source-ingestion/facade/SourceIngestionFacade";
import type { SemanticProcessingFacade } from "../../../../semantic-processing/facade/SemanticProcessingFacade";
import type { SemanticKnowledgeFacade } from "../../../../semantic-knowledge/facade/SemanticKnowledgeFacade";
import type { SourceType } from "../../../../source-ingestion/source/domain/SourceType";
import type { ProjectionType } from "../../../../semantic-processing/projection/domain/ProjectionType";
import type { ExecutePipelineInput, ExecutePipelineSuccess } from "../../contracts/dtos";
import { Result } from "../../../../shared/domain/Result";
import { KnowledgePipelineError } from "../../domain/KnowledgePipelineError";
import { PipelineStep } from "../../domain/PipelineStep";

// Default projection type when not specified
const DEFAULT_PROJECTION_TYPE = "EMBEDDING";

/**
 * Use Case: Execute Full Pipeline
 *
 * Coordinates the complete knowledge pipeline: Ingest → Process → Catalog.
 * Uses only the 3 construction facades (no Retrieval).
 *
 * Each step tracks completed steps for error reporting.
 * If a step fails, the error includes which steps completed successfully.
 */
export class ExecuteFullPipeline {
  constructor(
    private readonly _ingestion: SourceIngestionFacade,
    private readonly _processing: SemanticProcessingFacade,
    private readonly _knowledge: SemanticKnowledgeFacade,
  ) {}

  async execute(
    input: ExecutePipelineInput,
  ): Promise<Result<KnowledgePipelineError, ExecutePipelineSuccess>> {
    const completedSteps: PipelineStep[] = [];

    // ─── Step 1: Ingest ─────────────────────────────────────────────────────────
    const ingestionResult = await this._ingestion.ingestExtractAndReturn({
      sourceId: input.sourceId,
      sourceName: input.sourceName,
      uri: input.uri,
      type: input.sourceType as SourceType,
      extractionJobId: input.extractionJobId,
    });

    if (ingestionResult.isFail()) {
      return Result.fail(
        KnowledgePipelineError.fromStep(
          PipelineStep.Ingestion,
          ingestionResult.error,
          completedSteps,
        ),
      );
    }

    completedSteps.push(PipelineStep.Ingestion);

    // ─── Step 2: Process ────────────────────────────────────────────────────────
    const processingResult = await this._processing.processContent({
      projectionId: input.projectionId,
      semanticUnitId: input.semanticUnitId,
      semanticUnitVersion: 1,
      content: ingestionResult.value.extractedText,
      type: (input.projectionType ?? DEFAULT_PROJECTION_TYPE) as ProjectionType,
    });

    if (processingResult.isFail()) {
      return Result.fail(
        KnowledgePipelineError.fromStep(
          PipelineStep.Processing,
          processingResult.error,
          completedSteps,
        ),
      );
    }

    completedSteps.push(PipelineStep.Processing);

    // ─── Step 3: Catalog ────────────────────────────────────────────────────────
    const catalogResult = await this._knowledge.createSemanticUnitWithLineage({
      id: input.semanticUnitId,
      sourceId: input.sourceId,
      sourceType: input.sourceType,
      content: ingestionResult.value.extractedText,
      language: input.language,
      createdBy: input.createdBy,
      topics: input.topics,
      tags: input.tags,
      summary: input.summary,
      attributes: input.attributes,
    });

    if (catalogResult.isFail()) {
      return Result.fail(
        KnowledgePipelineError.fromStep(
          PipelineStep.Cataloging,
          catalogResult.error,
          completedSteps,
        ),
      );
    }

    // ─── Success ────────────────────────────────────────────────────────────────
    return Result.ok({
      sourceId: input.sourceId,
      unitId: catalogResult.value.unitId,
      projectionId: processingResult.value.projectionId,
      contentHash: ingestionResult.value.contentHash,
      extractedTextLength: ingestionResult.value.extractedText.length,
      chunksCount: processingResult.value.chunksCount,
      dimensions: processingResult.value.dimensions,
      model: processingResult.value.model,
    });
  }
}
