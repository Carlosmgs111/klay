/**
 * Extraction Module - Public API
 *
 * This module handles content extraction from sources (PDF, text, etc.).
 */

// ─── Domain ─────────────────────────────────────────────────────────────────
export {
  ExtractionJob,
  ExtractionJobId,
  ExtractionStatus,
  ExtractionCompleted,
  ExtractionFailed,
  // Domain Errors
  ExtractionJobNotFoundError,
  ExtractionSourceIdRequiredError,
  ExtractionInvalidStateError,
  ExtractionCannotStartError,
  ExtractionCannotCompleteError,
  ExtractionCannotFailError,
  ExtractionFailedError,
  UnsupportedMimeTypeError,
  ContentHashingError,
} from "./domain/index";

export type {
  ExtractionJobRepository,
  ContentExtractor,
  ExtractionResult,
  ExtractionError,
} from "./domain/index";

// ─── Application ────────────────────────────────────────────────────────────
export {
  ExecuteExtraction,
  ExtractionUseCases,
} from "./application/index";
export type {
  ExecuteExtractionCommand,
  ExecuteExtractionResult,
  ExtractorMap,
} from "./application/index";

// ─── Infrastructure Adapters (for custom composition) ──────────────────────
export {
  TextContentExtractor,
  BrowserPdfContentExtractor,
  ServerPdfContentExtractor,
} from "./infrastructure/adapters/index";

// ─── Composition & Factory ──────────────────────────────────────────────────
export { ExtractionComposer, extractionFactory } from "./composition/index";
export type {
  ExtractionInfraPolicy,
  ExtractionInfrastructurePolicy,
  ResolvedExtractionInfra,
  ExtractionFactoryResult,
} from "./composition/index";
