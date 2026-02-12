/**
 * Lineage Module Factory
 *
 * Entry point for creating the Lineage module.
 * Uses Composer for infrastructure resolution, then constructs UseCases.
 *
 * @example
 * ```typescript
 * const { useCases, infra } = await lineageFactory({ type: "server", dbPath: "./data" });
 * await useCases.registerTransformation.execute({ ... });
 * ```
 */

import type {
  LineageInfrastructurePolicy,
  ResolvedLineageInfra,
} from "./infra-policies";
import type { LineageUseCases } from "../application/index";

// ─── Factory Result Contract ─────────────────────────────────────────────────

export interface LineageFactoryResult {
  /** Assembled use cases ready for consumption */
  useCases: LineageUseCases;
  /**
   * Resolved infrastructure.
   * Exposed for facade coordination (e.g., repository access).
   * Should NOT be used directly by external consumers.
   */
  infra: ResolvedLineageInfra;
}

// ─── Factory Function ────────────────────────────────────────────────────────

export async function lineageFactory(
  policy: LineageInfrastructurePolicy
): Promise<LineageFactoryResult> {
  // 1. Resolve infrastructure via Composer (wiring only)
  const { LineageComposer } = await import("./LineageComposer");
  const infra = await LineageComposer.resolve(policy);

  // 2. Construct use cases with resolved dependencies
  const { LineageUseCases } = await import("../application/index");
  const useCases = new LineageUseCases(infra.repository, infra.eventPublisher);

  return { useCases, infra };
}
