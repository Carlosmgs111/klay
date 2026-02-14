import type { ResolvedPipelineDependencies } from "../application/KnowledgePipelineOrchestrator";

// ─── Pipeline Policy ────────────────────────────────────────────────────────

/**
 * Policy for the Knowledge Pipeline.
 *
 * Consumed ONLY by this Composer — the Orchestrator never reads policy.
 * The Composer translates the policy into facade policies for each context.
 */
export interface KnowledgePipelinePolicy {
  /** Infrastructure type: determines how each context resolves its adapters */
  type: "in-memory" | "browser" | "server";
  /** Database path for server-side persistence (shared across contexts) */
  dbPath?: string;
  /** Database name for browser-side persistence (shared across contexts) */
  dbName?: string;
  /** Embedding dimensions — must be consistent across processing and retrieval */
  embeddingDimensions?: number;
  /** Default chunking strategy for semantic processing */
  defaultChunkingStrategy?: "fixed-size" | "sentence" | "recursive";
  /** Embedding provider — forwarded to processing and retrieval */
  embeddingProvider?: string;
  /** Embedding model — forwarded to processing and retrieval */
  embeddingModel?: string;
  /**
   * Configuration overrides for testing or explicit environment setup.
   * Forwarded to all context facades.
   */
  configOverrides?: Record<string, string>;
}

// ─── Composer ───────────────────────────────────────────────────────────────

/**
 * KnowledgePipelineComposer — creates and wires the 4 bounded context facades.
 *
 * This is a COMPOSITION component only. It:
 * - Reads the policy
 * - Creates each context facade via their factory functions
 * - Handles cross-context wiring (vectorStoreConfig from processing → retrieval)
 * - Returns resolved dependencies for the Orchestrator
 *
 * It does NOT contain business logic, domain rules, or application flows.
 */
export class KnowledgePipelineComposer {
  /**
   * Resolves all 4 context facades and returns the wired dependencies.
   *
   * Resolution order:
   * 1. source-ingestion + semantic-knowledge (parallel — no cross-deps)
   * 2. semantic-processing (produces vectorStoreConfig)
   * 3. knowledge-retrieval (consumes vectorStoreConfig)
   */
  static async resolve(
    policy: KnowledgePipelinePolicy,
  ): Promise<ResolvedPipelineDependencies> {
    // ─── Step 1: Create independent contexts in parallel ────────────────────
    const [
      { createSourceIngestionFacade },
      { createSemanticKnowledgeFacade },
      { createSemanticProcessingFacade },
    ] = await Promise.all([
      import("../../../source-ingestion/facade/index"),
      import("../../../semantic-knowledge/facade/index"),
      import("../../../semantic-processing/facade/index"),
    ]);

    const [ingestion, knowledge, processing] = await Promise.all([
      createSourceIngestionFacade({
        type: policy.type,
        dbPath: policy.dbPath,
        dbName: policy.dbName,
        configOverrides: policy.configOverrides,
      }),
      createSemanticKnowledgeFacade({
        type: policy.type,
        dbPath: policy.dbPath,
        dbName: policy.dbName,
        configOverrides: policy.configOverrides,
      }),
      createSemanticProcessingFacade({
        type: policy.type,
        dbPath: policy.dbPath,
        dbName: policy.dbName,
        embeddingDimensions: policy.embeddingDimensions,
        defaultChunkingStrategy: policy.defaultChunkingStrategy,
        embeddingProvider: policy.embeddingProvider as any,
        embeddingModel: policy.embeddingModel,
        configOverrides: policy.configOverrides,
      }),
    ]);

    // ─── Step 2: Create retrieval with cross-context wiring ─────────────────
    const { createKnowledgeRetrievalFacade } = await import(
      "../../../knowledge-retrieval/facade/index"
    );

    const retrieval = await createKnowledgeRetrievalFacade({
      type: policy.type,
      vectorStoreConfig: processing.vectorStoreConfig,
      embeddingDimensions: policy.embeddingDimensions,
      embeddingProvider: policy.embeddingProvider as any,
      embeddingModel: policy.embeddingModel,
      configOverrides: policy.configOverrides,
    });

    return { ingestion, processing, knowledge, retrieval };
  }
}
