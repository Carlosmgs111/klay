// ═══════════════════════════════════════════════════════════════════════════
// Source Module
// ═══════════════════════════════════════════════════════════════════════════
export {
  Source,
  SourceId,
  SourceType,
  SourceVersion,
  SourceRegistered,
  SourceUpdated,
  SourceExtracted,
  SourceUseCases,
  SourceComposer,
  RegisterSource,
  UpdateSource,
  sourceFactory,
} from "./source/index";

export type {
  SourceRepository,
  SourceInfraPolicy,
  SourceInfrastructurePolicy,
  ResolvedSourceInfra,
  RegisterSourceCommand,
  UpdateSourceCommand,
  SourceFactoryResult,
} from "./source/index";

// ═══════════════════════════════════════════════════════════════════════════
// Extraction Module
// ═══════════════════════════════════════════════════════════════════════════
export {
  ExtractionJob,
  ExtractionJobId,
  ExtractionStatus,
  ExtractionCompleted,
  ExtractionFailed,
  ExtractionUseCases,
  ExtractionComposer,
  ExecuteExtraction,
  extractionFactory,
  UnsupportedMimeTypeError,
  // Content Extractors
  TextContentExtractor,
  BrowserPdfContentExtractor,
  ServerPdfContentExtractor,
} from "./extraction/index";

export type {
  ExtractionJobRepository,
  ContentExtractor,
  ExtractionResult,
  ExtractionInfraPolicy,
  ExtractionInfrastructurePolicy,
  ResolvedExtractionInfra,
  ExecuteExtractionCommand,
  ExecuteExtractionResult,
  ExtractionFactoryResult,
  ExtractorMap,
} from "./extraction/index";

// ═══════════════════════════════════════════════════════════════════════════
// Context Facade (Application Layer Entry Point)
// ═══════════════════════════════════════════════════════════════════════════
export {
  SourceIngestionFacade,
  SourceIngestionFacadeComposer,
  createSourceIngestionFacade,
} from "./application/facade/index";

export type {
  SourceIngestionFacadePolicy,
  SourceIngestionInfraPolicy,
  ResolvedSourceIngestionModules,
} from "./application/facade/index";
