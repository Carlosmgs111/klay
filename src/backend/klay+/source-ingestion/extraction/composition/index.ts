/**
 * Composition Root - Extraction Module
 *
 * This module is ONLY responsible for:
 * - Selecting infrastructure implementations based on policy
 * - Instantiating repositories and extractors
 * - Wiring dependencies
 * - Factory construction of UseCases
 *
 * It does NOT contain:
 * - Business logic
 * - Domain rules
 * - Application flows
 */

// ─── Composer (infrastructure wiring only) ──────────────────────────────────
export { ExtractionComposer } from "./ExtractionComposer";

// ─── Policies ───────────────────────────────────────────────────────────────
export type {
  ExtractionInfraPolicy,
  ExtractionInfrastructurePolicy,
  ResolvedExtractionInfra,
  ExtractorMap,
} from "./infra-policies";

// ─── Factory (module entry point) ───────────────────────────────────────────
export { extractionFactory } from "./extraction.factory";
export type { ExtractionFactoryResult } from "./extraction.factory";
