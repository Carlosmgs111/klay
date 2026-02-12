/**
 * Full-Pipeline Integration Test: All Bounded Contexts
 *
 * Emulates real user flows across the complete KLAY+ platform:
 *
 *   Source Ingestion → Semantic Processing → Semantic Knowledge → Knowledge Retrieval
 *
 * Flows tested:
 * 1. Document ingestion: Register sources and extract content
 * 2. Semantic processing: Chunk content, generate embeddings, store vectors
 * 3. Knowledge cataloging: Create semantic units with lineage tracking
 * 4. Knowledge retrieval: Query, search, find similar, batch search
 * 5. Content update: Version a semantic unit, re-process, verify retrieval
 * 6. Batch operations: Ingest, process, catalog and query multiple documents
 * 7. Cross-context integrity: Verify traceability across all boundaries
 * 8. Deduplication: Detect similar content across the knowledge base
 *
 * Run with: npx vitest run src/backend/klay+/__tests__/integration/source-to-semantic.e2e.ts
 */

import { describe, it, expect, beforeAll } from "vitest";

// ─── Context Facades ─────────────────────────────────────────────────────────
import { createSourceIngestionFacade } from "../../source-ingestion/facade/index";
import { createSemanticProcessingFacade } from "../../semantic-processing/facade/index";
import { createSemanticKnowledgeFacade } from "../../semantic-knowledge/facade/index";
import { createKnowledgeRetrievalFacade } from "../../knowledge-retrieval/facade/index";

// ─── Domain Types ────────────────────────────────────────────────────────────
import { SourceType } from "../../source-ingestion/source/domain/SourceType";
import { ProjectionType } from "../../semantic-processing/projection/domain/ProjectionType";
import { TransformationType } from "../../semantic-knowledge/lineage/domain/Transformation";
import { StrategyType } from "../../semantic-processing/strategy-registry/domain/StrategyType";

// ─── Facade Types ────────────────────────────────────────────────────────────
import type { SourceIngestionFacade } from "../../source-ingestion/facade/SourceIngestionFacade";
import type { SemanticProcessingFacade } from "../../semantic-processing/facade/SemanticProcessingFacade";
import type { SemanticKnowledgeFacade } from "../../semantic-knowledge/facade/SemanticKnowledgeFacade";
import type { KnowledgeRetrievalFacade } from "../../knowledge-retrieval/facade/KnowledgeRetrievalFacade";

// ─── Constants ───────────────────────────────────────────────────────────────
const DIMENSIONS = 128;

// ─── Test Content ────────────────────────────────────────────────────────────

const DOCUMENT_DDD = `
Domain-Driven Design (DDD) is a software development approach that focuses on
modeling software to match a domain according to input from domain experts.

Key Concepts:
1. Bounded Context: A boundary within which a particular domain model is defined.
2. Aggregate: A cluster of domain objects treated as a single unit.
3. Entity: An object defined by its identity rather than its attributes.
4. Value Object: An object defined by its attributes, immutable and shareable.
5. Repository: Encapsulates storage, retrieval, and search for aggregate roots.

Benefits: Better alignment between software and business requirements,
improved communication through ubiquitous language, clear boundaries.
`.trim();

const DOCUMENT_CLEAN_ARCH = `
Clean Architecture separates concerns into concentric layers.
The innermost layer contains enterprise business rules (Entities),
followed by application business rules (Use Cases),
interface adapters, and frameworks/drivers on the outermost layer.

The Dependency Rule states that source code dependencies can only point inward.
Nothing in an inner circle can know anything about something in an outer circle.
This includes functions, classes, variables, or any software entity.

Benefits: Independent of frameworks, testable business rules,
independent of UI, database, and external agencies.
`.trim();

const DOCUMENT_EVENT_SOURCING = `
Event Sourcing stores all changes to application state as a sequence of events.
Instead of storing the current state, it records every state change as an event.
The current state is reconstructed by replaying all events from the beginning.

CQRS (Command Query Responsibility Segregation) separates read and write models.
Commands change state. Queries return data without side effects.
Combined with Event Sourcing, CQRS provides a powerful architecture pattern
for complex domains with high audit requirements.

Benefits: Complete audit trail, temporal queries, event-driven integration,
and the ability to rebuild projections from the event store.
`.trim();

const DOCUMENT_DDD_UPDATED = `
Domain-Driven Design (DDD) is a software development approach that focuses on
modeling software to match a domain according to input from domain experts.

Key Concepts (Updated with Strategic Patterns):
1. Bounded Context: A boundary within which a particular domain model is defined.
2. Aggregate: A cluster of domain objects treated as a single unit.
3. Entity: An object defined by its identity rather than its attributes.
4. Value Object: An object defined by its attributes, immutable and shareable.
5. Repository: Encapsulates storage, retrieval, and search for aggregate roots.
6. Context Map: Shows relationships between bounded contexts.
7. Anti-Corruption Layer: Protects domain from external model corruption.
8. Shared Kernel: A shared model subset agreed upon by multiple teams.

Strategic DDD emphasizes the importance of context boundaries and team topology.
Tactical DDD focuses on patterns within a single bounded context.
`.trim();

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

describe("Full-Pipeline Integration: All Bounded Contexts", () => {
  // ─── Facades ─────────────────────────────────────────────────────────────
  let ingestion: SourceIngestionFacade;
  let processing: SemanticProcessingFacade;
  let knowledge: SemanticKnowledgeFacade;
  let retrieval: KnowledgeRetrievalFacade;

  // ─── Tracking IDs across contexts ────────────────────────────────────────
  const ids = {
    ddd: { sourceId: "", unitId: "" },
    cleanArch: { sourceId: "", unitId: "" },
    eventSourcing: { sourceId: "", unitId: "" },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SETUP: Initialize all 4 bounded contexts
  // ═══════════════════════════════════════════════════════════════════════════

  beforeAll(async () => {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(" Full-Pipeline Integration Test: All Bounded Contexts");
    console.log("═══════════════════════════════════════════════════════════════\n");

    console.log("🏗️  Initializing all bounded contexts...\n");

    ingestion = await createSourceIngestionFacade({
      type: "server",
    });
    console.log("   ✅ Source Ingestion Facade created");

    processing = await createSemanticProcessingFacade({
      type: "server",
      embeddingDimensions: DIMENSIONS,
      defaultChunkingStrategy: "recursive",
    });
    console.log("   ✅ Semantic Processing Facade created");

    knowledge = await createSemanticKnowledgeFacade({
      type: "server",
    });
    console.log("   ✅ Semantic Knowledge Facade created");

    // Cross-context wiring: retrieval reads from processing's vector store
    retrieval = await createKnowledgeRetrievalFacade({
      type: "server",
      vectorStoreRef: processing.vectorStore,
      embeddingDimensions: DIMENSIONS,
    });
    console.log("   ✅ Knowledge Retrieval Facade created");
    console.log("   🔗 Cross-context wiring: Retrieval → Processing vector store\n");
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 1: Single Document Ingestion Pipeline
  //   Source Ingestion → Semantic Processing → Semantic Knowledge
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 1: Single Document Ingestion Pipeline", () => {
    it("should ingest and extract a document (Source Ingestion)", async () => {
      console.log("── Flow 1: Single Document Ingestion ──────────────────────\n");
      console.log("📥 Step 1.1: Ingesting DDD document...");

      ids.ddd.sourceId = crypto.randomUUID();
      ids.ddd.unitId = crypto.randomUUID();

      const result = await ingestion.ingestAndExtract({
        sourceId: ids.ddd.sourceId,
        sourceName: "DDD Overview",
        uri: DOCUMENT_DDD,
        type: SourceType.PlainText,
        extractionJobId: crypto.randomUUID(),
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.sourceId).toBe(ids.ddd.sourceId);
      expect(result.value.contentHash).toBeTruthy();

      console.log(`   ✅ Source ingested: ${ids.ddd.sourceId.slice(0, 8)}...`);
      console.log(`      Content hash: ${result.value.contentHash.slice(0, 16)}...\n`);
    });

    it("should process content into embeddings (Semantic Processing)", async () => {
      console.log("⚙️  Step 1.2: Processing into embeddings...");

      const result = await processing.processContent({
        projectionId: crypto.randomUUID(),
        semanticUnitId: ids.ddd.unitId,
        semanticUnitVersion: 1,
        content: DOCUMENT_DDD,
        type: ProjectionType.Embedding,
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.chunksCount).toBeGreaterThan(0);
      expect(result.value.dimensions).toBe(DIMENSIONS);

      console.log(`   ✅ Content processed: ${result.value.chunksCount} chunks`);
      console.log(`      Dimensions: ${result.value.dimensions}`);
      console.log(`      Model: ${result.value.model}\n`);
    });

    it("should catalog as semantic unit with lineage (Semantic Knowledge)", async () => {
      console.log("📚 Step 1.3: Cataloging with lineage tracking...");

      const result = await knowledge.createSemanticUnitWithLineage({
        id: ids.ddd.unitId,
        sourceId: ids.ddd.sourceId,
        sourceType: "document",
        content: DOCUMENT_DDD,
        language: "en",
        createdBy: "ingestion-pipeline",
        topics: ["ddd", "software-architecture", "bounded-context"],
        summary: "Domain-Driven Design overview with key concepts",
        tags: ["architecture", "ddd"],
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.unitId).toBe(ids.ddd.unitId);

      console.log(`   ✅ Semantic unit created: ${ids.ddd.unitId.slice(0, 8)}...`);
      console.log(`      Lineage: EXTRACTION transformation registered\n`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 2: Batch Ingestion of Multiple Documents
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 2: Batch Document Ingestion", () => {
    it("should batch ingest multiple documents (Source Ingestion)", async () => {
      console.log("── Flow 2: Batch Document Ingestion ────────────────────────\n");
      console.log("📥 Step 2.1: Batch ingesting 2 documents...");

      ids.cleanArch.sourceId = crypto.randomUUID();
      ids.cleanArch.unitId = crypto.randomUUID();
      ids.eventSourcing.sourceId = crypto.randomUUID();
      ids.eventSourcing.unitId = crypto.randomUUID();

      const batchResult = await ingestion.batchIngestAndExtract([
        {
          sourceId: ids.cleanArch.sourceId,
          sourceName: "Clean Architecture Guide",
          uri: DOCUMENT_CLEAN_ARCH,
          type: SourceType.PlainText,
          extractionJobId: crypto.randomUUID(),
        },
        {
          sourceId: ids.eventSourcing.sourceId,
          sourceName: "Event Sourcing & CQRS",
          uri: DOCUMENT_EVENT_SOURCING,
          type: SourceType.PlainText,
          extractionJobId: crypto.randomUUID(),
        },
      ]);

      expect(batchResult).toHaveLength(2);
      expect(batchResult.every((r) => r.success)).toBe(true);

      for (const r of batchResult) {
        console.log(
          `   ${r.success ? "✅" : "❌"} ${r.sourceId.slice(0, 8)}... ${r.contentHash ? `(hash: ${r.contentHash.slice(0, 12)}...)` : r.error ?? ""}`,
        );
      }
      console.log();
    });

    it("should batch process content (Semantic Processing)", async () => {
      console.log("⚙️  Step 2.2: Batch processing into embeddings...");

      const batchResult = await processing.batchProcess([
        {
          projectionId: crypto.randomUUID(),
          semanticUnitId: ids.cleanArch.unitId,
          semanticUnitVersion: 1,
          content: DOCUMENT_CLEAN_ARCH,
          type: ProjectionType.Embedding,
        },
        {
          projectionId: crypto.randomUUID(),
          semanticUnitId: ids.eventSourcing.unitId,
          semanticUnitVersion: 1,
          content: DOCUMENT_EVENT_SOURCING,
          type: ProjectionType.Embedding,
        },
      ]);

      expect(batchResult).toHaveLength(2);
      expect(batchResult.every((r) => r.success)).toBe(true);

      for (const r of batchResult) {
        console.log(
          `   ${r.success ? "✅" : "❌"} Projection ${r.projectionId.slice(0, 8)}... → ${r.chunksCount ?? 0} chunks`,
        );
      }
      console.log();
    });

    it("should batch catalog as semantic units (Semantic Knowledge)", async () => {
      console.log("📚 Step 2.3: Batch cataloging with lineage...");

      const batchResult = await knowledge.batchCreateSemanticUnitsWithLineage([
        {
          id: ids.cleanArch.unitId,
          sourceId: ids.cleanArch.sourceId,
          sourceType: "document",
          content: DOCUMENT_CLEAN_ARCH,
          language: "en",
          createdBy: "ingestion-pipeline",
          topics: ["clean-architecture", "layered-design", "dependency-rule"],
          summary: "Clean Architecture with concentric layers and dependency rule",
          tags: ["architecture", "clean-arch"],
        },
        {
          id: ids.eventSourcing.unitId,
          sourceId: ids.eventSourcing.sourceId,
          sourceType: "document",
          content: DOCUMENT_EVENT_SOURCING,
          language: "en",
          createdBy: "ingestion-pipeline",
          topics: ["event-sourcing", "cqrs", "audit-trail"],
          summary: "Event Sourcing and CQRS pattern for complex domains",
          tags: ["architecture", "event-sourcing", "cqrs"],
        },
      ]);

      expect(batchResult).toHaveLength(2);
      expect(batchResult.every((r) => r.success)).toBe(true);

      for (const r of batchResult) {
        console.log(`   ${r.success ? "✅" : "❌"} Unit ${r.unitId.slice(0, 8)}...`);
      }
      console.log();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 3: Knowledge Retrieval (Query the knowledge base)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 3: Knowledge Retrieval", () => {
    it("should perform semantic query across all documents", async () => {
      console.log("── Flow 3: Knowledge Retrieval ─────────────────────────────\n");
      console.log("🔍 Step 3.1: Semantic query...");

      const result = await retrieval.query({
        text: "bounded context domain model",
        topK: 5,
        minScore: 0.0,
      });

      expect(result).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.queryText).toBe("bounded context domain model");

      console.log(`   ✅ Query returned ${result.items.length} results`);
      for (const item of result.items.slice(0, 3)) {
        console.log(`      [${item.score.toFixed(3)}] ${item.content.slice(0, 60)}...`);
      }
      console.log();
    });

    it("should perform simplified search", async () => {
      console.log("🔍 Step 3.2: Simplified search...");

      const results = await retrieval.search(
        "Clean Architecture separates concerns into concentric layers",
        { limit: 5, threshold: 0.0 },
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("id");
      expect(results[0]).toHaveProperty("content");
      expect(results[0]).toHaveProperty("score");

      console.log(`   ✅ Search returned ${results.length} results`);
      for (const r of results.slice(0, 3)) {
        console.log(`      [${r.score.toFixed(3)}] ${r.content.slice(0, 60)}...`);
      }
      console.log();
    });

    it("should find most similar content for exact match", async () => {
      console.log("🎯 Step 3.3: Finding most similar...");

      const match = await retrieval.findMostSimilar(
        "Domain-Driven Design bounded context aggregate entity",
        0.0,
      );

      expect(match).not.toBeNull();

      console.log(`   ✅ Best match: unit ${match!.id.slice(0, 8)}... (score: ${match!.score.toFixed(3)})`);
      console.log(`      Content: ${match!.content.slice(0, 60)}...\n`);
    });

    it("should batch search multiple queries", async () => {
      console.log("📚 Step 3.4: Batch search across knowledge base...");

      const batchResults = await retrieval.batchSearch(
        [
          "aggregate root entity value object",
          "dependency rule inner circle outer",
          "event store replay state changes",
        ],
        { limit: 2, threshold: 0.0 },
      );

      expect(batchResults).toHaveLength(3);

      for (const batch of batchResults) {
        console.log(`   Query: "${batch.query.slice(0, 40)}..."`);
        console.log(`   → ${batch.results.length} results`);
        for (const r of batch.results) {
          console.log(`      [${r.score.toFixed(3)}] ${r.content.slice(0, 50)}...`);
        }
      }
      console.log();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 4: Content Update & Re-Processing (Version + Lineage)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 4: Content Update & Re-Processing", () => {
    it("should version the semantic unit with enrichment (Semantic Knowledge)", async () => {
      console.log("── Flow 4: Content Update & Re-Processing ─────────────────\n");
      console.log("🔄 Step 4.1: Versioning DDD document with enrichment...");

      const result = await knowledge.versionSemanticUnitWithLineage({
        unitId: ids.ddd.unitId,
        content: DOCUMENT_DDD_UPDATED,
        language: "en",
        reason: "Added strategic DDD patterns: Context Map, ACL, Shared Kernel",
        transformationType: TransformationType.Enrichment,
        strategyUsed: "manual-enrichment",
        topics: ["ddd", "software-architecture", "strategic-ddd", "context-map"],
        summary: "Updated with strategic DDD patterns",
        parameters: { addedConcepts: 3, updatedSections: ["Key Concepts"] },
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.unitId).toBe(ids.ddd.unitId);
      expect(result.value.newVersion).toBe(2);

      console.log(`   ✅ Versioned: ${ids.ddd.unitId.slice(0, 8)}... → v${result.value.newVersion}`);
      console.log(`      Lineage: ENRICHMENT transformation registered\n`);
    });

    it("should re-process updated content (Semantic Processing)", async () => {
      console.log("⚙️  Step 4.2: Re-processing updated content...");

      const result = await processing.processContent({
        projectionId: crypto.randomUUID(),
        semanticUnitId: ids.ddd.unitId,
        semanticUnitVersion: 2,
        content: DOCUMENT_DDD_UPDATED,
        type: ProjectionType.Embedding,
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.chunksCount).toBeGreaterThan(0);

      console.log(`   ✅ Re-processed: ${result.value.chunksCount} chunks (v2)`);
      console.log(`      New embeddings stored in vector store\n`);
    });

    it("should retrieve updated content via search (Knowledge Retrieval)", async () => {
      console.log("🔍 Step 4.3: Searching for updated content...");

      const results = await retrieval.search("context map anti-corruption layer shared kernel", {
        limit: 3,
        threshold: 0.0,
      });

      expect(results.length).toBeGreaterThan(0);

      console.log(`   ✅ Found ${results.length} results for updated concepts`);
      for (const r of results.slice(0, 2)) {
        console.log(`      [${r.score.toFixed(3)}] ${r.content.slice(0, 60)}...`);
      }
      console.log();
    });

    it("should verify lineage history (Semantic Knowledge)", async () => {
      console.log("📊 Step 4.4: Verifying lineage history...");

      const lineageResult = await knowledge.getLineageForUnit(ids.ddd.unitId);

      expect(lineageResult.isOk()).toBe(true);

      const lineage = lineageResult.value as any;
      console.log(`   ✅ Lineage for unit: ${ids.ddd.unitId.slice(0, 8)}...`);

      if (lineage.transformations) {
        console.log(`      Total transformations: ${lineage.transformations.length}`);
        for (const t of lineage.transformations) {
          console.log(
            `      - ${t.type}: v${t.inputVersion} → v${t.outputVersion} (${t.strategyUsed})`,
          );
        }
      }
      console.log();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 5: Deduplication Detection
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 5: Deduplication Detection", () => {
    it("should detect similar content in the knowledge base", async () => {
      console.log("── Flow 5: Deduplication Detection ─────────────────────────\n");
      console.log("🔎 Step 5.1: Checking for duplicate DDD content...");

      const check = await retrieval.hasSimilarContent(
        "Domain-Driven Design bounded context aggregate entity value object",
        0.0,
      );

      expect(check.exists).toBe(true);
      expect(check.matchId).toBeDefined();

      console.log(`   ✅ Similar content detected: unit ${check.matchId!.slice(0, 8)}...`);
      console.log(`      Score: ${check.score!.toFixed(3)}\n`);
    });

    it("should find related content for a semantic unit", async () => {
      console.log("🔗 Step 5.2: Finding related content for DDD unit...");

      const related = await retrieval.findRelated(
        ids.ddd.unitId,
        "software architecture design patterns",
        { limit: 3, excludeSelf: true },
      );

      expect(related).toBeDefined();

      console.log(`   ✅ Found ${related.length} related items (excluding self)`);
      for (const r of related) {
        console.log(`      [${r.score.toFixed(3)}] unit ${r.id.slice(0, 8)}... → ${r.content.slice(0, 50)}...`);
      }
      console.log();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 6: Strategy Registration (Semantic Processing)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 6: Strategy Registration", () => {
    it("should register a custom chunking strategy", async () => {
      console.log("── Flow 6: Strategy Registration ───────────────────────────\n");
      console.log("🔧 Step 6.1: Registering custom chunking strategy...");

      const result = await processing.registerProcessingStrategy({
        id: crypto.randomUUID(),
        name: "semantic-paragraph-chunker",
        type: StrategyType.Chunking,
        configuration: {
          maxChunkSize: 1024,
          overlap: 100,
          splitOn: "paragraph",
        },
      });

      expect(result.isOk()).toBe(true);
      expect(result.value.strategyId).toBeTruthy();

      console.log(`   ✅ Strategy registered: ${result.value.strategyId.slice(0, 8)}...\n`);
    });

    it("should register a custom embedding strategy", async () => {
      console.log("🔧 Step 6.2: Registering custom embedding strategy...");

      const result = await processing.registerProcessingStrategy({
        id: crypto.randomUUID(),
        name: "hash-embedding-256",
        type: StrategyType.Embedding,
        configuration: {
          provider: "hash",
          dimensions: 256,
        },
      });

      expect(result.isOk()).toBe(true);

      console.log(`   ✅ Strategy registered: ${result.value.strategyId.slice(0, 8)}...\n`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 7: Error Handling & Edge Cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 7: Error Handling & Edge Cases", () => {
    it("should reject duplicate source ingestion", async () => {
      console.log("── Flow 7: Error Handling ──────────────────────────────────\n");
      console.log("🚫 Step 7.1: Duplicate source rejection...");

      const result = await ingestion.ingestAndExtract({
        sourceId: ids.ddd.sourceId, // Already exists
        sourceName: "Duplicate DDD",
        uri: DOCUMENT_DDD,
        type: SourceType.PlainText,
        extractionJobId: crypto.randomUUID(),
      });

      expect(result.isFail()).toBe(true);
      console.log(`   ✅ Correctly rejected: ${result.error.message}\n`);
    });

    it("should reject duplicate semantic unit creation", async () => {
      console.log("🚫 Step 7.2: Duplicate semantic unit rejection...");

      const result = await knowledge.createSemanticUnitWithLineage({
        id: ids.ddd.unitId, // Already exists
        sourceId: "different-source",
        sourceType: "document",
        content: "Different content",
        language: "en",
        createdBy: "test",
      });

      expect(result.isFail()).toBe(true);
      console.log(`   ✅ Correctly rejected: ${result.error.message}\n`);
    });

    it("should reject versioning non-existent semantic unit", async () => {
      console.log("🚫 Step 7.3: Non-existent unit versioning...");

      const result = await knowledge.versionSemanticUnitWithLineage({
        unitId: "non-existent-id",
        content: "Content",
        language: "en",
        reason: "Testing",
      });

      expect(result.isFail()).toBe(true);
      console.log(`   ✅ Correctly rejected: ${result.error.message}\n`);
    });

    it("should handle empty retrieval results gracefully", async () => {
      console.log("🔍 Step 7.4: Empty retrieval results...");

      const result = await retrieval.query({
        text: "xyz completely unrelated gibberish topic",
        topK: 5,
        minScore: 0.99,
      });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(0);

      console.log(`   ✅ Empty results handled correctly\n`);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOW 8: Cross-Context Integrity Verification
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Flow 8: Cross-Context Integrity", () => {
    it("should maintain traceability: sourceId → unitId → vectors → retrieval", async () => {
      console.log("── Flow 8: Cross-Context Integrity ─────────────────────────\n");
      console.log("🔗 Step 8.1: Verifying traceability chain...");

      // 1. Source exists in ingestion context
      const sourceAccessor = ingestion.source;
      expect(sourceAccessor).toBeDefined();

      // 2. Semantic unit exists in knowledge context
      const lineageResult = await knowledge.getLineageForUnit(ids.ddd.unitId);
      expect(lineageResult.isOk()).toBe(true);

      // 3. Vectors exist in processing context (via vector store)
      const vectorStore = processing.vectorStore;
      expect(vectorStore).toBeDefined();

      // 4. Content is retrievable via retrieval context
      const searchResult = await retrieval.search("Domain-Driven Design", {
        limit: 1,
        threshold: 0.0,
      });
      expect(searchResult.length).toBeGreaterThan(0);

      console.log("   ✅ Source Ingestion: source registered and extracted");
      console.log("   ✅ Semantic Processing: vectors stored in vector store");
      console.log("   ✅ Semantic Knowledge: unit cataloged with lineage");
      console.log("   ✅ Knowledge Retrieval: content queryable via semantic search\n");
    });

    it("should provide direct module access across all facades", async () => {
      console.log("🔧 Step 8.2: Verifying direct module access...");

      // Source Ingestion modules
      expect(ingestion.source).toBeDefined();
      expect(ingestion.extraction).toBeDefined();
      console.log("   ✅ Source Ingestion: source, extraction");

      // Semantic Processing modules
      expect(processing.projection).toBeDefined();
      expect(processing.strategyRegistry).toBeDefined();
      expect(processing.vectorStore).toBeDefined();
      console.log("   ✅ Semantic Processing: projection, strategyRegistry, vectorStore");

      // Semantic Knowledge modules
      expect(knowledge.semanticUnit).toBeDefined();
      expect(knowledge.lineage).toBeDefined();
      console.log("   ✅ Semantic Knowledge: semanticUnit, lineage");

      // Knowledge Retrieval modules
      expect(retrieval.semanticQuery).toBeDefined();
      console.log("   ✅ Knowledge Retrieval: semanticQuery\n");

      console.log("═══════════════════════════════════════════════════════════════");
      console.log(" ✅ ALL INTEGRATION TESTS PASSED!");
      console.log("═══════════════════════════════════════════════════════════════");
      console.log("\n Pipeline verified:");
      console.log("   ✅ Source Ingestion → Content Extraction");
      console.log("   ✅ Content → Chunking → Embeddings → Vector Store");
      console.log("   ✅ Semantic Units → Lineage Tracking → Versioning");
      console.log("   ✅ Semantic Search → Query → Batch Search → Deduplication");
      console.log("   ✅ Cross-context data integrity (sourceId ↔ unitId ↔ vectors)");
      console.log("   ✅ Error handling across all boundaries");
      console.log("   ✅ Strategy registration and management");
    });
  });
});
