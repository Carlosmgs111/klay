/**
 * Projection Module Factory
 *
 * Entry point for creating the Projection module.
 * Uses Composer for infrastructure resolution, then constructs UseCases.
 *
 * @example
 * ```typescript
 * const { useCases, infra } = await projectionFactory({
 *   type: "server",
 *   dbPath: "./data",
 *   aiSdkEmbeddingModel: openai("text-embedding-3-small"),
 * });
 * await useCases.generateProjection.execute({ ... });
 * ```
 */

import type {
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
} from "./infra-policies";
import type { ProjectionUseCases } from "../application/index";

// ─── Factory Result Contract ────────────────────────────────────────────────

export interface ProjectionFactoryResult {
  /** Assembled use cases ready for consumption */
  useCases: ProjectionUseCases;
  /**
   * Resolved infrastructure.
   * Exposed for facade/orchestrator coordination (e.g., vector store access).
   * Should NOT be used directly by external consumers.
   */
  infra: ResolvedProjectionInfra;
}

// ─── Factory Function ───────────────────────────────────────────────────────

export async function projectionFactory(
  policy: ProjectionInfrastructurePolicy,
): Promise<ProjectionFactoryResult> {
  // 1. Resolve infrastructure via Composer (wiring only)
  const { ProjectionComposer } = await import("./ProjectionComposer");
  const infra = await ProjectionComposer.resolve(policy);

  // 2. Construct use cases with resolved dependencies
  const { ProjectionUseCases } = await import("../application/index");
  const useCases = new ProjectionUseCases(
    infra.repository,
    infra.embeddingStrategy,
    infra.chunkingStrategy,
    infra.vectorWriteStore,
    infra.eventPublisher,
  );

  return { useCases, infra };
}
