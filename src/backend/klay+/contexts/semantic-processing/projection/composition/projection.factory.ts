/**
 * Projection Module Factory
 *
 * Entry point for creating the Projection module.
 * Uses Composer for infrastructure resolution, then constructs UseCases.
 *
 * Now requires a ProcessingProfileRepository from the processing-profile module
 * for cross-module wiring — GenerateProjection looks up profiles at runtime.
 *
 * @example
 * ```typescript
 * const { useCases, infra } = await projectionFactory(policy, profileRepository);
 * await useCases.generateProjection.execute({ ... });
 * ```
 */

import type {
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
} from "./infra-policies";
import type { ProjectionUseCases } from "../application/index";
import type { ProcessingProfileRepository } from "../../processing-profile/domain/ProcessingProfileRepository";

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
  profileRepository: ProcessingProfileRepository,
): Promise<ProjectionFactoryResult> {
  // 1. Resolve infrastructure via Composer (wiring only)
  const { ProjectionComposer } = await import("./ProjectionComposer");
  const infra = await ProjectionComposer.resolve(policy, profileRepository);

  // 2. Construct use cases with resolved dependencies
  const { ProjectionUseCases } = await import("../application/index");
  const useCases = new ProjectionUseCases(
    infra.repository,
    infra.profileRepository,
    infra.materializer,
    infra.vectorWriteStore,
    infra.eventPublisher,
  );

  return { useCases, infra };
}
