/**
 * Strategy Registry Module Factory
 *
 * Entry point for creating the Strategy Registry module.
 * Uses Composer for infrastructure resolution, then constructs UseCases.
 *
 * @example
 * ```typescript
 * const { useCases, infra } = await strategyRegistryFactory({
 *   type: "server",
 *   dbPath: "./data",
 * });
 * await useCases.registerStrategy.execute({ ... });
 * ```
 */

import type {
  StrategyRegistryInfrastructurePolicy,
  ResolvedStrategyRegistryInfra,
} from "./infra-policies";
import type { StrategyRegistryUseCases } from "../application/index";

// ─── Factory Result Contract ────────────────────────────────────────────────

export interface StrategyRegistryFactoryResult {
  /** Assembled use cases ready for consumption */
  useCases: StrategyRegistryUseCases;
  /**
   * Resolved infrastructure.
   * Exposed for facade/orchestrator coordination.
   * Should NOT be used directly by external consumers.
   */
  infra: ResolvedStrategyRegistryInfra;
}

// ─── Factory Function ───────────────────────────────────────────────────────

export async function strategyRegistryFactory(
  policy: StrategyRegistryInfrastructurePolicy,
): Promise<StrategyRegistryFactoryResult> {
  // 1. Resolve infrastructure via Composer (wiring only)
  const { StrategyRegistryComposer } = await import("./StrategyRegistryComposer");
  const infra = await StrategyRegistryComposer.resolve(policy);

  // 2. Construct use cases with resolved dependencies
  const { StrategyRegistryUseCases } = await import("../application/index");
  const useCases = new StrategyRegistryUseCases(
    infra.repository,
    infra.eventPublisher,
  );

  return { useCases, infra };
}
