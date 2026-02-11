import type { ProjectionUseCases } from "../projection/application/index";
import type { StrategyRegistryUseCases } from "../strategy-registry/application/index";
import type { VectorStoreAdapter } from "../projection/domain/ports/VectorStoreAdapter";
import type { ProjectionType } from "../projection/domain/ProjectionType";
import type { StrategyType } from "../strategy-registry/domain/StrategyType";
import type { ResolvedSemanticProcessingModules } from "./composition/infra-policies";
import { Result } from "../../shared/domain/Result";
import type { DomainError } from "../../shared/domain/errors";

// ─── Facade Result Types ────────────────────────────────────────────────────

export interface ProcessContentSuccess {
  projectionId: string;
  chunksCount: number;
  dimensions: number;
  model: string;
}

export interface RegisterStrategySuccess {
  strategyId: string;
}

// ─── Facade ─────────────────────────────────────────────────────────────────

/**
 * Application Facade for the Semantic Processing bounded context.
 *
 * Provides a unified entry point to all modules within the context,
 * coordinating use cases for content projection and strategy management.
 *
 * This is an Application Layer component - it does NOT contain domain logic.
 * It only coordinates existing use cases and handles cross-module workflows.
 *
 * This is a CONTEXT-LEVEL facade. Individual modules do NOT have facades.
 */
export class SemanticProcessingFacade {
  private readonly _projection: ProjectionUseCases;
  private readonly _strategyRegistry: StrategyRegistryUseCases;
  private readonly _vectorStore: VectorStoreAdapter;

  constructor(modules: ResolvedSemanticProcessingModules) {
    this._projection = modules.projection;
    this._strategyRegistry = modules.strategyRegistry;
    this._vectorStore = modules.vectorStore;
  }

  // ─── Module Accessors ─────────────────────────────────────────────────────

  get projection(): ProjectionUseCases {
    return this._projection;
  }

  get strategyRegistry(): StrategyRegistryUseCases {
    return this._strategyRegistry;
  }

  /**
   * Exposes the vector store for cross-context wiring.
   * The knowledge-retrieval context needs this to perform semantic queries.
   */
  get vectorStore(): VectorStoreAdapter {
    return this._vectorStore;
  }

  // ─── Workflow Operations ──────────────────────────────────────────────────

  /**
   * Processes content into semantic projections.
   * Chunks the content, generates embeddings, and stores vectors.
   */
  async processContent(params: {
    projectionId: string;
    semanticUnitId: string;
    semanticUnitVersion: number;
    content: string;
    type: ProjectionType;
  }): Promise<Result<DomainError, ProcessContentSuccess>> {
    const result = await this._projection.generateProjection.execute({
      projectionId: params.projectionId,
      semanticUnitId: params.semanticUnitId,
      semanticUnitVersion: params.semanticUnitVersion,
      content: params.content,
      type: params.type,
    });

    if (result.isFail()) {
      return Result.fail(result.error);
    }

    return Result.ok({
      projectionId: result.value.projectionId,
      chunksCount: result.value.chunksCount,
      dimensions: result.value.dimensions,
      model: result.value.model,
    });
  }

  /**
   * Registers a new processing strategy.
   */
  async registerProcessingStrategy(params: {
    id: string;
    name: string;
    type: StrategyType;
    configuration?: Record<string, unknown>;
  }): Promise<Result<DomainError, RegisterStrategySuccess>> {
    const result = await this._strategyRegistry.registerStrategy.execute({
      id: params.id,
      name: params.name,
      type: params.type,
      configuration: params.configuration,
    });

    if (result.isFail()) {
      return Result.fail(result.error);
    }

    return Result.ok({ strategyId: params.id });
  }

  /**
   * Batch processes multiple semantic units.
   */
  async batchProcess(
    items: Array<{
      projectionId: string;
      semanticUnitId: string;
      semanticUnitVersion: number;
      content: string;
      type: ProjectionType;
    }>,
  ): Promise<
    Array<{
      projectionId: string;
      success: boolean;
      chunksCount?: number;
      error?: string;
    }>
  > {
    const results = await Promise.allSettled(
      items.map((item) => this.processContent(item)),
    );

    return results.map((promiseResult, index) => {
      if (promiseResult.status === "fulfilled") {
        const result = promiseResult.value;
        if (result.isOk()) {
          return {
            projectionId: result.value.projectionId,
            success: true,
            chunksCount: result.value.chunksCount,
          };
        }
        return {
          projectionId: items[index].projectionId,
          success: false,
          error: result.error.message,
        };
      }
      return {
        projectionId: items[index].projectionId,
        success: false,
        error:
          promiseResult.reason instanceof Error
            ? promiseResult.reason.message
            : String(promiseResult.reason),
      };
    });
  }
}
