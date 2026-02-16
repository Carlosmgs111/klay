/**
 * Semantic Unit Module Factory
 *
 * Entry point for creating the Semantic Unit module.
 * Uses Composer for infrastructure resolution, then constructs UseCases.
 *
 * @example
 * ```typescript
 * const { useCases, infra } = await semanticUnitFactory({ type: "server", dbPath: "./data" });
 * await useCases.createSemanticUnit.execute({ ... });
 * ```
 */

import type {
  SemanticUnitInfrastructurePolicy,
  ResolvedSemanticUnitInfra,
} from "./infra-policies";
import type { SemanticUnitUseCases } from "../application/index";

// ─── Factory Result Contract ─────────────────────────────────────────────────

export interface SemanticUnitFactoryResult {
  /** Assembled use cases ready for consumption */
  useCases: SemanticUnitUseCases;
  /**
   * Resolved infrastructure.
   * Exposed for facade coordination (e.g., repository access).
   * Should NOT be used directly by external consumers.
   */
  infra: ResolvedSemanticUnitInfra;
}

// ─── Factory Function ────────────────────────────────────────────────────────

export async function semanticUnitFactory(
  policy: SemanticUnitInfrastructurePolicy
): Promise<SemanticUnitFactoryResult> {
  // 1. Resolve infrastructure via Composer (wiring only)
  const { SemanticUnitComposer } = await import("./SemanticUnitComposer");
  const infra = await SemanticUnitComposer.resolve(policy);

  // 2. Construct use cases with resolved dependencies
  const { SemanticUnitUseCases } = await import("../application/index");
  const useCases = new SemanticUnitUseCases(infra.repository, infra.eventPublisher);

  return { useCases, infra };
}
