/**
 * Knowledge Pipeline — Orchestrator Module
 *
 * Runtime-agnostic application service that coordinates all 4 bounded contexts
 * into a unified knowledge processing pipeline.
 *
 * Public API:
 * - KnowledgePipelinePort: the single entry point (interface)
 * - DTOs: input/output contracts
 * - KnowledgePipelineError: error with pipeline step tracking
 * - PipelineStep: enum of pipeline stages
 * - createKnowledgePipeline(): factory function
 * - KnowledgePipelinePolicy: configuration type
 *
 * NOT exported (internal):
 * - KnowledgePipelineOrchestrator (implementation)
 * - Use cases
 * - Facades
 */

// ─── Port ────────────────────────────────────────────────────────────────────
export type { KnowledgePipelinePort } from "./contracts/KnowledgePipelinePort";

// ─── DTOs ────────────────────────────────────────────────────────────────────
export type {
  ExecutePipelineInput,
  ExecutePipelineSuccess,
  IngestDocumentInput,
  IngestDocumentSuccess,
  ProcessDocumentInput,
  ProcessDocumentSuccess,
  CatalogDocumentInput,
  CatalogDocumentSuccess,
  SearchKnowledgeInput,
  SearchKnowledgeSuccess,
  CreateProcessingProfileInput,
  CreateProcessingProfileSuccess,
} from "./contracts/dtos";

// ─── Domain ──────────────────────────────────────────────────────────────────
export { KnowledgePipelineError } from "./domain/KnowledgePipelineError";
export { PipelineStep } from "./domain/PipelineStep";
export type { PipelineStep as PipelineStepType } from "./domain/PipelineStep";

// ─── Factory ─────────────────────────────────────────────────────────────────
export { createKnowledgePipeline } from "./composition/knowledge-pipeline.factory";

// ─── Policy Type ─────────────────────────────────────────────────────────────
export type { KnowledgePipelinePolicy } from "./composition/KnowledgePipelineComposer";
