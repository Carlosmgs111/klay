import type { SourceUseCases } from "../../source/application/index";
import type { ExtractionUseCases } from "../../extraction/application/index";
import type { SourceRepository } from "../../source/domain/SourceRepository";
import type { SourceType } from "../../source/domain/SourceType";
import { SourceType as SourceTypeEnum } from "../../source/domain/SourceType";
import { SourceId } from "../../source/domain/SourceId";
import { SourceNotFoundError } from "../../source/domain/errors";
import type { ResolvedSourceIngestionModules } from "./composition/infra-policies";
import { Result } from "../../../shared/domain/Result";
import type { DomainError } from "../../../shared/domain/errors";

// ─── SourceType to MIME Type Mapping ─────────────────────────────────────────

const SOURCE_TYPE_TO_MIME: Record<SourceType, string> = {
  [SourceTypeEnum.Pdf]: "application/pdf",
  [SourceTypeEnum.Web]: "text/html",
  [SourceTypeEnum.Api]: "application/json",
  [SourceTypeEnum.PlainText]: "text/plain",
  [SourceTypeEnum.Markdown]: "text/markdown",
  [SourceTypeEnum.Csv]: "text/csv",
  [SourceTypeEnum.Json]: "application/json",
};

// ─── Facade Result Types ─────────────────────────────────────────────────────

export interface RegisterSourceSuccess {
  sourceId: string;
}

export interface ExtractSourceSuccess {
  jobId: string;
  contentHash: string;
  changed: boolean;
}

export interface IngestAndExtractSuccess {
  sourceId: string;
  jobId: string;
  contentHash: string;
}

// ─── Facade ──────────────────────────────────────────────────────────────────

/**
 * Application Facade for the Source Ingestion bounded context.
 *
 * Provides a unified entry point to all modules within the context,
 * coordinating use cases for source registration and content extraction.
 *
 * This is an Application Layer component - it does NOT contain domain logic.
 * It only coordinates existing use cases and handles cross-module workflows.
 *
 * The facade coordinates the flow:
 * 1. Source registration (stores reference only)
 * 2. Content extraction (extracts text from URI)
 * 3. Source update (records extraction hash)
 */
export class SourceIngestionFacade {
  private readonly _source: SourceUseCases;
  private readonly _extraction: ExtractionUseCases;
  private readonly _sourceRepository: SourceRepository;

  constructor(modules: ResolvedSourceIngestionModules) {
    this._source = modules.source;
    this._extraction = modules.extraction;
    this._sourceRepository = modules.sourceRepository;
  }

  // ─── Module Accessors ──────────────────────────────────────────────────────

  get source(): SourceUseCases {
    return this._source;
  }

  get extraction(): ExtractionUseCases {
    return this._extraction;
  }

  // ─── Workflow Operations ───────────────────────────────────────────────────

  /**
   * Registers a source (stores reference only, no extraction).
   */
  async registerSource(params: {
    id: string;
    name: string;
    uri: string;
    type: SourceType;
  }): Promise<Result<DomainError, RegisterSourceSuccess>> {
    const registerResult = await this._source.registerSource.execute({
      id: params.id,
      name: params.name,
      type: params.type,
      uri: params.uri,
    });

    if (registerResult.isFail()) {
      return Result.fail(registerResult.error);
    }

    return Result.ok({ sourceId: params.id });
  }

  /**
   * Executes extraction for a registered source.
   * Coordinates the full flow:
   * 1. Fetches source from repository
   * 2. Executes extraction (pure, no source dependency)
   * 3. Updates source with content hash
   */
  async extractSource(params: {
    jobId: string;
    sourceId: string;
  }): Promise<Result<DomainError, ExtractSourceSuccess>> {
    // 1. Fetch source from repository
    const sourceId = SourceId.create(params.sourceId);
    const source = await this._sourceRepository.findById(sourceId);

    if (!source) {
      return Result.fail(new SourceNotFoundError(params.sourceId));
    }

    // 2. Execute extraction with URI and mimeType
    const mimeType = SOURCE_TYPE_TO_MIME[source.type];
    const extractionResult = await this._extraction.executeExtraction.execute({
      jobId: params.jobId,
      sourceId: params.sourceId,
      uri: source.uri,
      mimeType,
    });

    if (extractionResult.isFail()) {
      return Result.fail(extractionResult.error);
    }

    // 3. Update source with content hash
    const updateResult = await this._source.updateSource.execute({
      sourceId: params.sourceId,
      contentHash: extractionResult.value.contentHash,
    });

    if (updateResult.isFail()) {
      return Result.fail(updateResult.error);
    }

    return Result.ok({
      jobId: params.jobId,
      contentHash: extractionResult.value.contentHash,
      changed: updateResult.value.changed,
    });
  }

  /**
   * Registers a source and immediately executes extraction.
   * This is the complete ingestion workflow.
   */
  async ingestAndExtract(params: {
    sourceId: string;
    sourceName: string;
    uri: string;
    type: SourceType;
    extractionJobId: string;
  }): Promise<Result<DomainError, IngestAndExtractSuccess>> {
    // Register source
    const registerResult = await this.registerSource({
      id: params.sourceId,
      name: params.sourceName,
      uri: params.uri,
      type: params.type,
    });

    if (registerResult.isFail()) {
      return Result.fail(registerResult.error);
    }

    // Execute extraction
    const extractionResult = await this.extractSource({
      jobId: params.extractionJobId,
      sourceId: params.sourceId,
    });

    if (extractionResult.isFail()) {
      return Result.fail(extractionResult.error);
    }

    return Result.ok({
      sourceId: params.sourceId,
      jobId: params.extractionJobId,
      contentHash: extractionResult.value.contentHash,
    });
  }

  /**
   * Batch registration of multiple sources (no extraction).
   */
  async batchRegister(
    sources: Array<{
      id: string;
      name: string;
      uri: string;
      type: SourceType;
    }>,
  ): Promise<
    Array<{
      sourceId: string;
      success: boolean;
      error?: string;
    }>
  > {
    const results = await Promise.allSettled(
      sources.map((source) => this.registerSource(source)),
    );

    return results.map((promiseResult, index) => {
      if (promiseResult.status === "fulfilled") {
        const result = promiseResult.value;
        if (result.isOk()) {
          return {
            sourceId: result.value.sourceId,
            success: true,
          };
        }
        return {
          sourceId: sources[index].id,
          success: false,
          error: result.error.message,
        };
      }
      return {
        sourceId: sources[index].id,
        success: false,
        error: promiseResult.reason instanceof Error ? promiseResult.reason.message : String(promiseResult.reason),
      };
    });
  }

  /**
   * Batch ingestion with extraction.
   */
  async batchIngestAndExtract(
    sources: Array<{
      sourceId: string;
      sourceName: string;
      uri: string;
      type: SourceType;
      extractionJobId: string;
    }>,
  ): Promise<
    Array<{
      sourceId: string;
      jobId: string;
      success: boolean;
      contentHash?: string;
      error?: string;
    }>
  > {
    const results = await Promise.allSettled(
      sources.map((source) => this.ingestAndExtract(source)),
    );

    return results.map((promiseResult, index) => {
      if (promiseResult.status === "fulfilled") {
        const result = promiseResult.value;
        if (result.isOk()) {
          return {
            sourceId: result.value.sourceId,
            jobId: result.value.jobId,
            success: true,
            contentHash: result.value.contentHash,
          };
        }
        return {
          sourceId: sources[index].sourceId,
          jobId: sources[index].extractionJobId,
          success: false,
          error: result.error.message,
        };
      }
      return {
        sourceId: sources[index].sourceId,
        jobId: sources[index].extractionJobId,
        success: false,
        error: promiseResult.reason instanceof Error ? promiseResult.reason.message : String(promiseResult.reason),
      };
    });
  }
}
