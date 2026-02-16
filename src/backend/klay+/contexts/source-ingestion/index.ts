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
} from "./source";

export type {
  SourceRepository,
  SourceInfraPolicy,
  SourceInfrastructurePolicy,
  ResolvedSourceInfra,
  RegisterSourceCommand,
  UpdateSourceCommand,
  SourceFactoryResult,
} from "./source";

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
} from "./extraction";

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
} from "./extraction";

// ═══════════════════════════════════════════════════════════════════════════
// Context Facade (Application Layer Entry Point)
// ═══════════════════════════════════════════════════════════════════════════
export {
  SourceIngestionFacade,
  SourceIngestionFacadeComposer,
  createSourceIngestionFacade,
} from "./facade";

export type {
  SourceIngestionFacadePolicy,
  SourceIngestionInfraPolicy,
  ResolvedSourceIngestionModules,
} from "./facade";
