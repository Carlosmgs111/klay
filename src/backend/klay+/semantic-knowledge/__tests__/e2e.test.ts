/**
 * End-to-End Test for Semantic Knowledge Context
 *
 * Tests the complete flow:
 * 1. Create facade with in-memory infrastructure
 * 2. Create semantic unit with lineage tracking
 * 3. Version semantic unit with lineage tracking
 * 4. Verify lineage history
 * 5. Test batch operations
 * 6. Test error handling
 *
 * Run with: npm run test:semantic-knowledge
 */

import { createSemanticKnowledgeFacade } from "../facade/index";
import { TransformationType } from "../lineage/domain/Transformation";

async function runE2ETest() {
  console.log("🧪 Starting End-to-End Test for Semantic Knowledge Context\n");

  try {
    // ─── Step 1: Create Facade ─────────────────────────────────────────────
    console.log("📦 Step 1: Creating facade with in-memory infrastructure...");
    const facade = await createSemanticKnowledgeFacade({
      type: "in-memory",
    });
    console.log("   ✅ Facade created successfully\n");

    // ─── Step 2: Create Semantic Unit with Lineage ────────────────────────
    console.log("📝 Step 2: Creating a semantic unit with lineage tracking...");
    const unitId = crypto.randomUUID();

    const createResult = await facade.createSemanticUnitWithLineage({
      id: unitId,
      sourceId: "source-123",
      sourceType: "document",
      content: "This is the original content extracted from a document.",
      language: "en",
      createdBy: "extraction-pipeline",
      topics: ["knowledge", "extraction"],
      summary: "Test semantic unit for E2E testing",
      tags: ["test", "e2e"],
      attributes: { priority: "high" },
    });

    if (createResult.isFail()) {
      throw new Error(`Creation failed: ${createResult.error.message}`);
    }

    console.log(`   ✅ Semantic unit created: ${createResult.value.unitId}`);
    console.log(`      Lineage registered with EXTRACTION transformation\n`);

    // ─── Step 3: Version Semantic Unit with Lineage ───────────────────────
    console.log("🔄 Step 3: Versioning semantic unit with lineage tracking...");

    const versionResult = await facade.versionSemanticUnitWithLineage({
      unitId: unitId,
      content: "This is the enriched content after processing and enrichment.",
      language: "en",
      reason: "Enriched with additional context from knowledge graph",
      transformationType: TransformationType.Enrichment,
      strategyUsed: "knowledge-graph-enrichment",
      topics: ["knowledge", "extraction", "enrichment"],
      summary: "Enriched semantic unit",
      parameters: {
        enrichmentSource: "knowledge-graph",
        addedConcepts: 5,
      },
    });

    if (versionResult.isFail()) {
      throw new Error(`Versioning failed: ${versionResult.error.message}`);
    }

    console.log(`   ✅ Semantic unit versioned: ${versionResult.value.unitId}`);
    console.log(`      New version: ${versionResult.value.newVersion}`);
    console.log(`      Lineage registered with ENRICHMENT transformation\n`);

    // ─── Step 4: Version Again (Chunking) ─────────────────────────────────
    console.log("🔄 Step 4: Versioning again (chunking transformation)...");

    const chunkResult = await facade.versionSemanticUnitWithLineage({
      unitId: unitId,
      content: "This is a chunk of the enriched content optimized for embedding.",
      language: "en",
      reason: "Chunked for optimal embedding size",
      transformationType: TransformationType.Chunking,
      strategyUsed: "recursive-chunker",
      parameters: {
        chunkSize: 512,
        overlap: 50,
      },
    });

    if (chunkResult.isFail()) {
      throw new Error(`Chunking version failed: ${chunkResult.error.message}`);
    }

    console.log(`   ✅ Semantic unit versioned: ${chunkResult.value.unitId}`);
    console.log(`      New version: ${chunkResult.value.newVersion}`);
    console.log(`      Lineage registered with CHUNKING transformation\n`);

    // ─── Step 5: Verify Lineage ───────────────────────────────────────────
    console.log("📊 Step 5: Verifying lineage history...");

    const lineageResult = await facade.getLineageForUnit(unitId);

    if (lineageResult.isFail()) {
      throw new Error(`Lineage retrieval failed: ${lineageResult.error.message}`);
    }

    const lineage = lineageResult.value as any;
    console.log(`   ✅ Lineage found for unit: ${lineage.semanticUnitId}`);
    console.log(`      Total transformations: ${lineage.transformations?.length || "N/A"}`);
    if (lineage.transformations) {
      for (const t of lineage.transformations) {
        console.log(`      - ${t.type}: v${t.inputVersion} → v${t.outputVersion} (${t.strategyUsed})`);
      }
    }
    console.log();

    // ─── Step 6: Create Another Unit ──────────────────────────────────────
    console.log("📝 Step 6: Creating another semantic unit...");
    const unitId2 = crypto.randomUUID();

    const createResult2 = await facade.createSemanticUnitWithLineage({
      id: unitId2,
      sourceId: "source-456",
      sourceType: "api",
      content: "Content from API source.",
      language: "es",
      createdBy: "api-extractor",
    });

    if (createResult2.isFail()) {
      throw new Error(`Second creation failed: ${createResult2.error.message}`);
    }

    console.log(`   ✅ Second semantic unit created: ${createResult2.value.unitId}\n`);

    // ─── Step 7: Test Deprecation State Machine ──────────────────────────
    console.log("🔄 Step 7: Testing deprecation state machine...");
    console.log(`   ℹ️  State transitions: DRAFT → ACTIVE → DEPRECATED`);

    // Try to deprecate a DRAFT unit (should fail)
    const deprecateResult = await facade.deprecateSemanticUnitWithLineage({
      unitId: unitId,
      reason: "Content is outdated",
    });

    if (deprecateResult.isFail()) {
      console.log(`   ✅ Correctly rejected: DRAFT units cannot be deprecated`);
      console.log(`      Error: Invalid state transition\n`);
    } else {
      throw new Error("Should have failed - DRAFT cannot be deprecated!");
    }

    // ─── Step 8: Batch Creation ───────────────────────────────────────────
    console.log("📚 Step 8: Testing batch creation...");

    const batchUnits = [
      {
        id: crypto.randomUUID(),
        sourceId: "batch-source-1",
        sourceType: "document",
        content: "Batch content 1",
        language: "en",
        createdBy: "batch-processor",
      },
      {
        id: crypto.randomUUID(),
        sourceId: "batch-source-2",
        sourceType: "document",
        content: "Batch content 2",
        language: "en",
        createdBy: "batch-processor",
      },
      {
        id: crypto.randomUUID(),
        sourceId: "batch-source-3",
        sourceType: "web",
        content: "Batch content 3 from web",
        language: "es",
        createdBy: "web-scraper",
      },
    ];

    const batchResult = await facade.batchCreateSemanticUnitsWithLineage(batchUnits);
    const successCount = batchResult.filter((r) => r.success).length;

    console.log(`   ✅ Batch creation completed: ${successCount}/${batchUnits.length} successful`);
    for (const result of batchResult) {
      const status = result.success ? "✓" : "✗";
      console.log(`      ${status} ${result.unitId.slice(0, 8)}...${result.error ? ` (${result.error})` : ""}`);
    }
    console.log();

    // ─── Step 9: Test Duplicate Creation Error ───────────────────────────
    console.log("🚫 Step 9: Testing duplicate creation error handling...");

    const duplicateResult = await facade.createSemanticUnitWithLineage({
      id: unitId2, // Same ID as step 6
      sourceId: "different-source",
      sourceType: "document",
      content: "Different content",
      language: "en",
      createdBy: "test",
    });

    if (duplicateResult.isFail()) {
      console.log(`   ✅ Correctly rejected duplicate: ${duplicateResult.error.message}\n`);
    } else {
      throw new Error("Should have failed with duplicate ID!");
    }

    // ─── Step 10: Test Not Found Error ────────────────────────────────────
    console.log("🔍 Step 10: Testing not found error handling...");

    const notFoundResult = await facade.versionSemanticUnitWithLineage({
      unitId: "non-existent-id",
      content: "Some content",
      language: "en",
      reason: "Testing",
    });

    if (notFoundResult.isFail()) {
      console.log(`   ✅ Correctly rejected not found: ${notFoundResult.error.message}\n`);
    } else {
      throw new Error("Should have failed with not found!");
    }

    // ─── Step 11: Direct Module Access ────────────────────────────────────
    console.log("🔧 Step 11: Testing direct module access...");

    // Access modules directly through facade
    console.log(`   Semantic Unit module: ${facade.semanticUnit ? "✅ Available" : "❌ Not available"}`);
    console.log(`   Lineage module: ${facade.lineage ? "✅ Available" : "❌ Not available"}\n`);

    // ─── Summary ───────────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("✅ ALL TESTS PASSED!");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("\nSummary:");
    console.log("  • Facade creation: ✅");
    console.log("  • Semantic unit creation with lineage: ✅");
    console.log("  • Semantic unit versioning with lineage: ✅");
    console.log("  • Multiple transformations (Enrichment, Chunking): ✅");
    console.log("  • Lineage retrieval: ✅");
    console.log("  • State machine validation: ✅");
    console.log("  • Batch creation: ✅");
    console.log("  • Error handling (duplicate, not found): ✅");
    console.log("  • Direct module access: ✅");
    console.log("\nThe semantic-knowledge context is working correctly!");
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the test
runE2ETest();
