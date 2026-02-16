/**
 * Composition Root - Semantic Unit Module
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
export { SemanticUnitComposer } from "./SemanticUnitComposer";

// ─── Policies ───────────────────────────────────────────────────────────────
export type {
  SemanticUnitInfraPolicy,
  SemanticUnitInfrastructurePolicy,
  ResolvedSemanticUnitInfra,
} from "./infra-policies";

// ─── Factory (module entry point) ───────────────────────────────────────────
export { semanticUnitFactory } from "./semantic-unit.factory";
export type { SemanticUnitFactoryResult } from "./semantic-unit.factory";
