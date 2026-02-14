import type { SemanticProcessingFacade } from "../../../../semantic-processing/facade/SemanticProcessingFacade";
import type { ProjectionType } from "../../../../semantic-processing/projection/domain/ProjectionType";
import type { ProcessDocumentInput, ProcessDocumentSuccess } from "../../contracts/dtos";
import { Result } from "../../../../shared/domain/Result";
import { KnowledgePipelineError } from "../../domain/KnowledgePipelineError";
import { PipelineStep } from "../../domain/PipelineStep";

// Default projection type when not specified
const DEFAULT_PROJECTION_TYPE = "EMBEDDING";

/**
 * Use Case: Process Document
 *
 * Processes content into semantic projections (chunking + embeddings)
 * via the SemanticProcessingFacade.
 */
export class ProcessDocument {
  constructor(
    private readonly _processing: SemanticProcessingFacade,
  ) {}

  async execute(
    input: ProcessDocumentInput,
    completedSteps: PipelineStep[] = [],
  ): Promise<Result<KnowledgePipelineError, ProcessDocumentSuccess>> {
    const result = await this._processing.processContent({
      projectionId: input.projectionId,
      semanticUnitId: input.semanticUnitId,
      semanticUnitVersion: input.semanticUnitVersion,
      content: input.content,
      type: (input.projectionType ?? DEFAULT_PROJECTION_TYPE) as ProjectionType,
    });

    if (result.isFail()) {
      return Result.fail(
        KnowledgePipelineError.fromStep(
          PipelineStep.Processing,
          result.error,
          completedSteps,
        ),
      );
    }

    return Result.ok({
      projectionId: result.value.projectionId,
      chunksCount: result.value.chunksCount,
      dimensions: result.value.dimensions,
      model: result.value.model,
    });
  }
}
