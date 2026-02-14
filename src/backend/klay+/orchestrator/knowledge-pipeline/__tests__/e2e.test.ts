/**
 * Knowledge Pipeline Orchestrator — E2E Tests
 *
 * Tests the complete orchestrator using in-memory infrastructure.
 * Validates the full pipeline flow, granular operations, error tracking,
 * and architectural boundaries.
 *
 * Run with:
 *   npx vitest run src/backend/klay+/orchestrator/knowledge-pipeline/__tests__/e2e.test.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";

import { createKnowledgePipeline } from "../composition/knowledge-pipeline.factory";
import type { KnowledgePipelinePort } from "../contracts/KnowledgePipelinePort";
import { PipelineStep } from "../domain/PipelineStep";
import { KnowledgePipelineError } from "../domain/KnowledgePipelineError";

// ─── Load Test Fixtures ────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, "../../../__tests__/integration/fixtures");

function loadFixture(filename: string): string {
  const filePath = path.join(FIXTURES_DIR, filename);
  return fs.readFileSync(filePath, "utf-8").trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe("Knowledge Pipeline Orchestrator — E2E", () => {
  let pipeline: KnowledgePipelinePort;

  // ─── Setup ──────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    pipeline = await createKnowledgePipeline({
      type: "in-memory",
      embeddingDimensions: 128,
      defaultChunkingStrategy: "recursive",
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Full Pipeline: execute()
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Full Pipeline — execute()", () => {
    it("should execute the complete pipeline: ingest → process → catalog", async () => {
      const content = loadFixture("ddd-overview.txt");

      // Create a temp file for ingestion (source-ingestion reads from URI)
      const tmpFile = path.join(FIXTURES_DIR, "ddd-overview.txt");

      const result = await pipeline.execute({
        sourceId: "src-ddd-001",
        sourceName: "DDD Overview",
        uri: tmpFile,
        sourceType: "PLAIN_TEXT",
        extractionJobId: "job-ddd-001",
        projectionId: "proj-ddd-001",
        semanticUnitId: "unit-ddd-001",
        language: "en",
        createdBy: "test",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.sourceId).toBe("src-ddd-001");
        expect(result.value.unitId).toBe("unit-ddd-001");
        expect(result.value.projectionId).toBe("proj-ddd-001");
        expect(result.value.contentHash).toBeTruthy();
        expect(result.value.extractedTextLength).toBeGreaterThan(0);
        expect(result.value.chunksCount).toBeGreaterThan(0);
        expect(result.value.dimensions).toBe(128);
        expect(result.value.model).toBeTruthy();
      }
    });

    it("should fail at ingestion step for duplicate source", async () => {
      const tmpFile = path.join(FIXTURES_DIR, "ddd-overview.txt");

      // Try to re-ingest with the same sourceId
      const result = await pipeline.execute({
        sourceId: "src-ddd-001", // already exists
        sourceName: "DDD Overview Duplicate",
        uri: tmpFile,
        sourceType: "PLAIN_TEXT",
        extractionJobId: "job-ddd-dup",
        projectionId: "proj-ddd-dup",
        semanticUnitId: "unit-ddd-dup",
        language: "en",
        createdBy: "test",
      });

      expect(result.isFail()).toBe(true);
      if (result.isFail()) {
        expect(result.error).toBeInstanceOf(KnowledgePipelineError);
        expect(result.error.step).toBe(PipelineStep.Ingestion);
        expect(result.error.completedSteps).toEqual([]);
        expect(result.error.code).toBe("PIPELINE_INGESTION_FAILED");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Granular Operations
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Granular Operations", () => {
    it("should ingest a document independently", async () => {
      const tmpFile = path.join(FIXTURES_DIR, "clean-architecture.txt");

      const result = await pipeline.ingestDocument({
        sourceId: "src-clean-001",
        sourceName: "Clean Architecture",
        uri: tmpFile,
        sourceType: "PLAIN_TEXT",
        extractionJobId: "job-clean-001",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.sourceId).toBe("src-clean-001");
        expect(result.value.extractedText).toBeTruthy();
        expect(result.value.extractedText.length).toBeGreaterThan(0);
        expect(result.value.contentHash).toBeTruthy();
      }
    });

    it("should process a document independently", async () => {
      const content = loadFixture("clean-architecture.txt");

      const result = await pipeline.processDocument({
        projectionId: "proj-clean-001",
        semanticUnitId: "unit-clean-001",
        semanticUnitVersion: 1,
        content,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.projectionId).toBe("proj-clean-001");
        expect(result.value.chunksCount).toBeGreaterThan(0);
        expect(result.value.dimensions).toBe(128);
      }
    });

    it("should catalog a document independently", async () => {
      const content = loadFixture("clean-architecture.txt");

      const result = await pipeline.catalogDocument({
        id: "unit-clean-001",
        sourceId: "src-clean-001",
        sourceType: "PLAIN_TEXT",
        content,
        language: "en",
        createdBy: "test",
        topics: ["architecture", "clean-code"],
        tags: ["software-design"],
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.unitId).toBe("unit-clean-001");
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Search — Independent from Construction Pipeline
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Search Knowledge", () => {
    it("should search the knowledge base after pipeline execution", async () => {
      const result = await pipeline.searchKnowledge({
        queryText: "domain driven design",
        topK: 5,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.queryText).toBe("domain driven design");
        expect(result.value.items).toBeDefined();
        expect(result.value.totalFound).toBeGreaterThanOrEqual(0);
      }
    });

    it("should return results with expected shape", async () => {
      const result = await pipeline.searchKnowledge({
        queryText: "software architecture patterns",
        topK: 3,
        minScore: 0.0,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (const item of result.value.items) {
          expect(item).toHaveProperty("semanticUnitId");
          expect(item).toHaveProperty("content");
          expect(item).toHaveProperty("score");
          expect(item).toHaveProperty("version");
          expect(item).toHaveProperty("metadata");
          expect(typeof item.score).toBe("number");
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Error Tracking: Step + CompletedSteps
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Error Tracking", () => {
    it("should track completed steps when cataloging fails (duplicate unit)", async () => {
      const esFile = path.join(FIXTURES_DIR, "event-sourcing.txt");

      // Create a temp copy of the same file with a unique path
      // (source-ingestion enforces URI uniqueness, so we need a distinct URI)
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "klay-pipeline-"));
      const esCopyFile = path.join(tmpDir, "event-sourcing-copy.txt");
      fs.copyFileSync(esFile, esCopyFile);

      // First: full pipeline succeeds with event-sourcing document
      const first = await pipeline.execute({
        sourceId: "src-es-001",
        sourceName: "Event Sourcing",
        uri: esFile,
        sourceType: "PLAIN_TEXT",
        extractionJobId: "job-es-001",
        projectionId: "proj-es-001",
        semanticUnitId: "unit-es-001",
        language: "en",
        createdBy: "test",
      });
      expect(first.isOk()).toBe(true);

      // Second: DIFFERENT source + URI but SAME semanticUnitId → should fail at cataloging
      // Uses a copy with different path to avoid source-ingestion's URI uniqueness constraint
      const second = await pipeline.execute({
        sourceId: "src-es-002",
        sourceName: "Event Sourcing v2",
        uri: esCopyFile,
        sourceType: "PLAIN_TEXT",
        extractionJobId: "job-es-002",
        projectionId: "proj-es-002",
        semanticUnitId: "unit-es-001", // duplicate unit ID → cataloging fails
        language: "en",
        createdBy: "test",
      });

      expect(second.isFail()).toBe(true);
      if (second.isFail()) {
        expect(second.error.step).toBe(PipelineStep.Cataloging);
        // Ingestion and Processing succeeded before Cataloging failed
        expect(second.error.completedSteps).toContain(PipelineStep.Ingestion);
        expect(second.error.completedSteps).toContain(PipelineStep.Processing);
        expect(second.error.completedSteps).not.toContain(PipelineStep.Cataloging);
      }
    });

    it("KnowledgePipelineError.fromStep should extract code and message from original error", () => {
      const originalError = {
        message: "Source not found",
        code: "SOURCE_NOT_FOUND",
      };

      const pipelineError = KnowledgePipelineError.fromStep(
        PipelineStep.Ingestion,
        originalError,
        [],
      );

      expect(pipelineError.step).toBe("ingestion");
      expect(pipelineError.code).toBe("PIPELINE_INGESTION_FAILED");
      expect(pipelineError.originalCode).toBe("SOURCE_NOT_FOUND");
      expect(pipelineError.originalMessage).toBe("Source not found");
      expect(pipelineError.completedSteps).toEqual([]);
    });

    it("KnowledgePipelineError.fromStep should handle unknown error types gracefully", () => {
      const pipelineError = KnowledgePipelineError.fromStep(
        PipelineStep.Processing,
        42,
        [PipelineStep.Ingestion],
      );

      expect(pipelineError.step).toBe("processing");
      expect(pipelineError.originalCode).toBeUndefined();
      expect(pipelineError.originalMessage).toBeUndefined();
      expect(pipelineError.completedSteps).toEqual(["ingestion"]);
    });

    it("KnowledgePipelineError.toJSON should produce serializable output", () => {
      const error = KnowledgePipelineError.fromStep(
        PipelineStep.Cataloging,
        new Error("Something went wrong"),
        [PipelineStep.Ingestion, PipelineStep.Processing],
      );

      const json = error.toJSON();
      expect(json.name).toBe("KnowledgePipelineError");
      expect(json.step).toBe("cataloging");
      expect(json.code).toBe("PIPELINE_CATALOGING_FAILED");
      expect(json.completedSteps).toEqual(["ingestion", "processing"]);
      expect(json.originalMessage).toBe("Something went wrong");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Full Pipeline with Second Document
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Multiple Documents", () => {
    it("should process a second document through the full pipeline", async () => {
      const tmpFile = path.join(FIXTURES_DIR, "ddd-overview-updated.txt");

      const result = await pipeline.execute({
        sourceId: "src-ddd-v2-001",
        sourceName: "DDD Overview Updated",
        uri: tmpFile,
        sourceType: "PLAIN_TEXT",
        extractionJobId: "job-ddd-v2-001",
        projectionId: "proj-ddd-v2-001",
        semanticUnitId: "unit-ddd-v2-001",
        language: "en",
        createdBy: "test",
        topics: ["ddd", "architecture"],
        tags: ["updated"],
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.sourceId).toBe("src-ddd-v2-001");
        expect(result.value.unitId).toBe("unit-ddd-v2-001");
        expect(result.value.chunksCount).toBeGreaterThan(0);
      }
    });
  });
});
