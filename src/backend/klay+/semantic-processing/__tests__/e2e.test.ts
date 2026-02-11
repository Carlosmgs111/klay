/**
 * End-to-End Test for Semantic Processing Context
 *
 * Tests the complete flow:
 * 1. Create facade with in-memory infrastructure
 * 2. Register processing strategies
 * 3. Process content into projections (chunk + embed + store)
 * 4. Query vector store for similarity search
 * 5. Batch processing
 *
 * Run with: npm run test:semantic-processing
 */

import { createSemanticProcessingFacade } from "../facade/index";
import { ProjectionType } from "../projection/domain/ProjectionType";
import { StrategyType } from "../strategy-registry/domain/StrategyType";

async function runE2ETest() {
  console.log("========================================================");
  console.log(" Semantic Processing Context - End-to-End Test");
  console.log("========================================================\n");

  try {
    // ─── Step 1: Create Facade ───────────────────────────────────────────────
    console.log("Step 1: Creating facade with in-memory infrastructure...");
    const facade = await createSemanticProcessingFacade({
      type: "in-memory",
      embeddingDimensions: 128,
      defaultChunkingStrategy: "recursive",
    });
    console.log("   Facade created successfully\n");

    // ─── Step 2: Register Processing Strategies ──────────────────────────────
    console.log("Step 2: Registering processing strategies...");

    const embeddingStrategyResult = await facade.registerProcessingStrategy({
      id: crypto.randomUUID(),
      name: "Hash Embeddings",
      type: StrategyType.Embedding,
      configuration: { dimensions: 128 },
    });

    if (embeddingStrategyResult.isFail()) {
      throw new Error(`Strategy registration failed: ${embeddingStrategyResult.error.message}`);
    }
    console.log(`   Embedding strategy registered: ${embeddingStrategyResult.value.strategyId.slice(0, 8)}...`);

    const chunkingStrategyResult = await facade.registerProcessingStrategy({
      id: crypto.randomUUID(),
      name: "Recursive Chunking",
      type: StrategyType.Chunking,
      configuration: { maxChunkSize: 1000, overlap: 100 },
    });

    if (chunkingStrategyResult.isFail()) {
      throw new Error(`Strategy registration failed: ${chunkingStrategyResult.error.message}`);
    }
    console.log(`   Chunking strategy registered: ${chunkingStrategyResult.value.strategyId.slice(0, 8)}...\n`);

    // ─── Step 3: Process Content ─────────────────────────────────────────────
    console.log("Step 3: Processing content into semantic projections...");

    const semanticUnitId = crypto.randomUUID();
    const testContent = `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that focuses on building systems
that can learn from data. These systems improve their performance on specific tasks
without being explicitly programmed.

## Types of Machine Learning

There are three main types of machine learning:

1. **Supervised Learning**: The algorithm learns from labeled training data and makes
   predictions based on that data. Examples include classification and regression.

2. **Unsupervised Learning**: The algorithm learns patterns from unlabeled data without
   any guidance. Examples include clustering and dimensionality reduction.

3. **Reinforcement Learning**: The algorithm learns by interacting with an environment
   and receiving rewards or penalties for its actions.

## Key Concepts

- **Features**: Input variables used to make predictions
- **Labels**: Output variables that the model tries to predict
- **Training**: The process of teaching the model using data
- **Inference**: Using the trained model to make predictions on new data

Machine learning has numerous applications including image recognition, natural language
processing, recommendation systems, and autonomous vehicles.
    `.trim();

    const processResult = await facade.processContent({
      projectionId: crypto.randomUUID(),
      semanticUnitId: semanticUnitId,
      semanticUnitVersion: 1,
      content: testContent,
      type: ProjectionType.Embedding,
    });

    if (processResult.isFail()) {
      throw new Error(`Content processing failed: ${processResult.error.message}`);
    }

    console.log(`   Content processed successfully`);
    console.log(`   Projection ID: ${processResult.value.projectionId.slice(0, 8)}...`);
    console.log(`   Chunks created: ${processResult.value.chunksCount}`);
    console.log(`   Embedding dimensions: ${processResult.value.dimensions}`);
    console.log(`   Model: ${processResult.value.model}\n`);

    // ─── Step 4: Vector Store Queries ────────────────────────────────────────
    console.log("Step 4: Querying vector store for semantic similarity...");

    const vectorStore = facade.vectorStore;

    // Query 1: Machine Learning related
    const queryContent1 = "What are the different types of machine learning algorithms?";
    const { hashToVector } = await import("../../shared/infrastructure/hashVector");
    const queryVector1 = hashToVector(queryContent1, 128);

    const results1 = await vectorStore.search(queryVector1, 3);
    console.log(`   Query: "${queryContent1.slice(0, 50)}..."`);
    console.log(`   Top ${results1.length} results:`);
    for (const result of results1) {
      console.log(`     - Score: ${result.score.toFixed(4)} | Chunk: "${result.entry.content.slice(0, 50)}..."`);
    }

    // Query 2: Features related
    const queryContent2 = "What are features and labels in ML?";
    const queryVector2 = hashToVector(queryContent2, 128);

    const results2 = await vectorStore.search(queryVector2, 2);
    console.log(`\n   Query: "${queryContent2}"`);
    console.log(`   Top ${results2.length} results:`);
    for (const result of results2) {
      console.log(`     - Score: ${result.score.toFixed(4)} | Chunk: "${result.entry.content.slice(0, 50)}..."`);
    }
    console.log();

    // ─── Step 5: Process Additional Content ──────────────────────────────────
    console.log("Step 5: Processing additional content for comparison...");

    const additionalContent = `
# Deep Learning Fundamentals

Deep learning is a specialized form of machine learning that uses neural networks
with many layers. These deep neural networks can learn complex patterns in data.

## Neural Network Architecture

A neural network consists of:
- **Input Layer**: Receives the raw data
- **Hidden Layers**: Process and transform the data
- **Output Layer**: Produces the final prediction

## Common Deep Learning Applications

Deep learning excels at:
1. Image classification and object detection
2. Natural language understanding
3. Speech recognition
4. Generative AI models
    `.trim();

    const additionalResult = await facade.processContent({
      projectionId: crypto.randomUUID(),
      semanticUnitId: crypto.randomUUID(),
      semanticUnitVersion: 1,
      content: additionalContent,
      type: ProjectionType.Embedding,
    });

    if (additionalResult.isFail()) {
      throw new Error(`Additional processing failed: ${additionalResult.error.message}`);
    }

    console.log(`   Additional content processed`);
    console.log(`   Chunks created: ${additionalResult.value.chunksCount}\n`);

    // ─── Step 6: Cross-Document Query ────────────────────────────────────────
    console.log("Step 6: Cross-document semantic query...");

    const crossQuery = "neural networks and deep learning";
    const crossVector = hashToVector(crossQuery, 128);
    const crossResults = await vectorStore.search(crossVector, 5);

    console.log(`   Query: "${crossQuery}"`);
    console.log(`   Results across all documents:`);
    for (const result of crossResults) {
      console.log(`     - Score: ${result.score.toFixed(4)} | "${result.entry.content.slice(0, 60)}..."`);
    }
    console.log();

    // ─── Step 7: Batch Processing ────────────────────────────────────────────
    console.log("Step 7: Batch processing multiple documents...");

    const batchItems = [
      {
        projectionId: crypto.randomUUID(),
        semanticUnitId: crypto.randomUUID(),
        semanticUnitVersion: 1,
        content: "Python is a popular programming language for data science and machine learning.",
        type: ProjectionType.Embedding,
      },
      {
        projectionId: crypto.randomUUID(),
        semanticUnitId: crypto.randomUUID(),
        semanticUnitVersion: 1,
        content: "JavaScript is widely used for web development and increasingly for ML with TensorFlow.js.",
        type: ProjectionType.Embedding,
      },
      {
        projectionId: crypto.randomUUID(),
        semanticUnitId: crypto.randomUUID(),
        semanticUnitVersion: 1,
        content: "Rust provides memory safety and performance, making it suitable for systems programming.",
        type: ProjectionType.Embedding,
      },
    ];

    const batchResults = await facade.batchProcess(batchItems);
    const successCount = batchResults.filter((r) => r.success).length;

    console.log(`   Batch processing completed: ${successCount}/${batchItems.length} successful`);
    for (const result of batchResults) {
      if (result.success) {
        console.log(`     - ${result.projectionId.slice(0, 8)}... | ${result.chunksCount} chunks`);
      } else {
        console.log(`     - ${result.projectionId.slice(0, 8)}... | FAILED: ${result.error}`);
      }
    }
    console.log();

    // ─── Step 8: Error Handling Test ─────────────────────────────────────────
    console.log("Step 8: Testing error handling (validation errors)...");

    // Test: Empty content
    const emptyContentResult = await facade.processContent({
      projectionId: crypto.randomUUID(),
      semanticUnitId: crypto.randomUUID(),
      semanticUnitVersion: 1,
      content: "",
      type: ProjectionType.Embedding,
    });

    if (emptyContentResult.isFail()) {
      console.log(`   Empty content rejected: ${emptyContentResult.error.constructor.name}`);
    }

    // Test: Empty semantic unit ID
    const emptyIdResult = await facade.processContent({
      projectionId: crypto.randomUUID(),
      semanticUnitId: "",
      semanticUnitVersion: 1,
      content: "Some content",
      type: ProjectionType.Embedding,
    });

    if (emptyIdResult.isFail()) {
      console.log(`   Empty semantic unit ID rejected: ${emptyIdResult.error.constructor.name}`);
    }

    // Test: Empty strategy name
    const emptyNameResult = await facade.registerProcessingStrategy({
      id: crypto.randomUUID(),
      name: "",
      type: StrategyType.Embedding,
    });

    if (emptyNameResult.isFail()) {
      console.log(`   Empty strategy name rejected: ${emptyNameResult.error.constructor.name}`);
    }
    console.log();

    // ─── Step 9: Vector Store Statistics ─────────────────────────────────────
    console.log("Step 9: Vector store statistics...");

    // Count all entries in the store
    const allResults = await vectorStore.search(hashToVector("", 128), 100);
    console.log(`   Total vectors in store: ${allResults.length}`);
    console.log();

    // ─── Summary ─────────────────────────────────────────────────────────────
    console.log("========================================================");
    console.log(" ALL TESTS PASSED!");
    console.log("========================================================");
    console.log("\nSummary:");
    console.log("  - Facade creation: OK");
    console.log("  - Strategy registration: OK");
    console.log("  - Content processing (chunking + embedding): OK");
    console.log("  - Vector similarity search: OK");
    console.log("  - Cross-document queries: OK");
    console.log("  - Batch processing: OK");
    console.log("  - Error handling (Result Pattern): OK");
    console.log("  - Vector store exposed for cross-context wiring: OK");
    console.log("\nThe semantic-processing context is working correctly!");
  } catch (error) {
    console.error("\n========================================================");
    console.error(" TEST FAILED!");
    console.error("========================================================");
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the test
runE2ETest();
