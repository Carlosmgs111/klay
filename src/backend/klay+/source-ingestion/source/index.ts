/**
 * Source Module - Public API
 *
 * This module manages source references (URIs, metadata, version tracking).
 * It does NOT store content - that's handled by the extraction module.
 */

// ─── Domain ──────────────────────────────────────────────────────────────────
export {
  Source,
  SourceId,
  SourceType,
  SourceVersion,
  SourceRegistered,
  SourceUpdated,
  SourceExtracted,
  // Domain Errors
  SourceNotFoundError,
  SourceAlreadyExistsError,
  SourceNameRequiredError,
  SourceUriRequiredError,
  SourceInvalidUriError,
  SourceInvalidTypeError,
} from "./domain/index";

export type { SourceRepository, SourceError } from "./domain/index";

// ─── Application ─────────────────────────────────────────────────────────────
export { RegisterSource, UpdateSource, SourceUseCases } from "./application/index";
export type { RegisterSourceCommand, UpdateSourceCommand } from "./application/index";

// ─── Composition & Factory ───────────────────────────────────────────────────
export { SourceComposer, sourceFactory } from "./composition/index";
export type {
  SourceInfraPolicy,
  SourceInfrastructurePolicy,
  ResolvedSourceInfra,
  SourceFactoryResult,
} from "./composition/index";
