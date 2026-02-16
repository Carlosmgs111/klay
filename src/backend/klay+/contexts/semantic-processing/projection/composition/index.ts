/**
 * Composition Root - Projection Module
 *
 * This module is ONLY responsible for:
 * - Selecting infrastructure implementations based on policy
 * - Instantiating repositories and adapters
 * - Materializing processing profiles into concrete strategies
 * - Wiring dependencies
 * - Factory construction of UseCases
 *
 * It does NOT contain:
 * - Business logic
 * - Domain rules
 * - Application flows
 */

// ─── Composer (infrastructure wiring only) ──────────────────────────────────
export { ProjectionComposer } from "./ProjectionComposer";

// ─── Materializer (profile → strategies) ────────────────────────────────────
export { ProcessingProfileMaterializer } from "./ProcessingProfileMaterializer";
export type { MaterializedStrategies } from "./ProcessingProfileMaterializer";

// ─── Policies ───────────────────────────────────────────────────────────────
export type {
  ProjectionInfraPolicy,
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
  EmbeddingProvider,
} from "./infra-policies";

// ─── Factory (module entry point) ───────────────────────────────────────────
export { projectionFactory } from "./projection.factory";
export type { ProjectionFactoryResult } from "./projection.factory";
