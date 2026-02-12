/**
 * Composition Root - Lineage Module
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
export { LineageComposer } from "./LineageComposer";

// ─── Policies ───────────────────────────────────────────────────────────────
export type {
  LineageInfraPolicy,
  LineageInfrastructurePolicy,
  ResolvedLineageInfra,
} from "./infra-policies";

// ─── Factory (module entry point) ───────────────────────────────────────────
export { lineageFactory } from "./lineage.factory";
export type { LineageFactoryResult } from "./lineage.factory";
