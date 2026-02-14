import type { SourceIngestionFacade } from "../../../source-ingestion/facade/SourceIngestionFacade";
import type { SemanticProcessingFacade } from "../../../semantic-processing/facade/SemanticProcessingFacade";
import type { SemanticKnowledgeFacade } from "../../../semantic-knowledge/facade/SemanticKnowledgeFacade";
import type { KnowledgeRetrievalFacade } from "../../../knowledge-retrieval/facade/KnowledgeRetrievalFacade";
import type { KnowledgePipelinePort } from "../contracts/KnowledgePipelinePort";
import type {
  ExecutePipelineInput,
  ExecutePipelineSuccess,
  IngestDocumentInput,
  IngestDocumentSuccess,
  ProcessDocumentInput,
  ProcessDocumentSuccess,
  CatalogDocumentInput,
  CatalogDocumentSuccess,
  SearchKnowledgeInput,
  SearchKnowledgeSuccess,
} from "../contracts/dtos";
import type { Result } from "../../../shared/domain/Result";
import type { KnowledgePipelineError } from "../domain/KnowledgePipelineError";
import { ExecuteFullPipeline } from "./use-cases/ExecuteFullPipeline";
import { IngestDocument } from "./use-cases/IngestDocument";
import { ProcessDocument } from "./use-cases/ProcessDocument";
import { CatalogDocument } from "./use-cases/CatalogDocument";
import { SearchKnowledge } from "./use-cases/SearchKnowledge";

/**
 * Resolved dependencies for the KnowledgePipelineOrchestrator.
 * Created by the Composer — not read from policy.
 */
export interface ResolvedPipelineDependencies {
  ingestion: SourceIngestionFacade;
  processing: SemanticProcessingFacade;
  knowledge: SemanticKnowledgeFacade;
  retrieval: KnowledgeRetrievalFacade;
}

/**
 * KnowledgePipelineOrchestrator — Application Boundary.
 *
 * Implements KnowledgePipelinePort as the single public API.
 * Receives 4 facades privately and creates use cases internally.
 *
 * This is NOT a bounded context — it's an application layer that
 * coordinates existing bounded contexts via their facades.
 *
 * Rules:
 * - No facade getters — facades are private implementation details
 * - No policy reading — the Composer handles infrastructure selection
 * - No domain logic — only delegation to use cases
 * - No framework dependencies — pure TypeScript
 */
export class KnowledgePipelineOrchestrator implements KnowledgePipelinePort {
  private readonly _executeFullPipeline: ExecuteFullPipeline;
  private readonly _ingestDocument: IngestDocument;
  private readonly _processDocument: ProcessDocument;
  private readonly _catalogDocument: CatalogDocument;
  private readonly _searchKnowledge: SearchKnowledge;

  constructor(deps: ResolvedPipelineDependencies) {
    // Create use cases with only the facades they need
    this._executeFullPipeline = new ExecuteFullPipeline(
      deps.ingestion,
      deps.processing,
      deps.knowledge,
    );
    this._ingestDocument = new IngestDocument(deps.ingestion);
    this._processDocument = new ProcessDocument(deps.processing);
    this._catalogDocument = new CatalogDocument(deps.knowledge);
    this._searchKnowledge = new SearchKnowledge(deps.retrieval);
  }

  // ─── KnowledgePipelinePort Implementation ──────────────────────────────────

  async execute(
    input: ExecutePipelineInput,
  ): Promise<Result<KnowledgePipelineError, ExecutePipelineSuccess>> {
    return this._executeFullPipeline.execute(input);
  }

  async ingestDocument(
    input: IngestDocumentInput,
  ): Promise<Result<KnowledgePipelineError, IngestDocumentSuccess>> {
    return this._ingestDocument.execute(input);
  }

  async processDocument(
    input: ProcessDocumentInput,
  ): Promise<Result<KnowledgePipelineError, ProcessDocumentSuccess>> {
    return this._processDocument.execute(input);
  }

  async catalogDocument(
    input: CatalogDocumentInput,
  ): Promise<Result<KnowledgePipelineError, CatalogDocumentSuccess>> {
    return this._catalogDocument.execute(input);
  }

  async searchKnowledge(
    input: SearchKnowledgeInput,
  ): Promise<Result<KnowledgePipelineError, SearchKnowledgeSuccess>> {
    return this._searchKnowledge.execute(input);
  }
}
