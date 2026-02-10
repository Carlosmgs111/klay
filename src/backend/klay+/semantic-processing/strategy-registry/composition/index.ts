/**
 * Composition Root - Strategy Registry Module
 *
 * This module is ONLY responsible for:
 * - Selecting infrastructure implementations based on policy
 * - Instantiating repositories and publishers
 * - Wiring dependencies
 * - Factory construction of UseCases
 *
 * It does NOT contain:
 * - Business logic
 * - Domain rules
 * - Application flows
 */

// ─── Composer (infrastructure wiring only) ──────────────────────────────────
export { StrategyRegistryComposer } from "./StrategyRegistryComposer";

// ─── Policies ───────────────────────────────────────────────────────────────
export type {
  StrategyRegistryInfraPolicy,
  StrategyRegistryInfrastructurePolicy,
  ResolvedStrategyRegistryInfra,
} from "./infra-policies";

// ─── Factory (module entry point) ───────────────────────────────────────────
export { strategyRegistryFactory } from "./strategy-registry.factory";
export type { StrategyRegistryFactoryResult } from "./strategy-registry.factory";
