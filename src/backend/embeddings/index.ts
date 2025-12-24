/*
 * this is module will genererate embeddings
 * - Process embeddings
 *   - Generate embeddings from text using LLM
 *   - Save embeddings in a vetorial database
 * - Recover embeddings
 */
import type { EmbeddingAPI } from "./@core-contracts/api";
import { LevelVectorStore } from "./infrastructure/repositories/LocalLevelVectorDB";
import { AIEmbeddingProvider } from "./infrastructure/providers/AIEmbeddingProvider";
import { EmbeddingUseCases } from "./application/UseCases";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";

const vectorStore = new LevelVectorStore({
  dbPath: "./db",
  dimensions: 1024,
  similarityThreshold: 0.5,
});

const embeddingProvider = new AIEmbeddingProvider();

export const embeddingAPI: EmbeddingAPI = new EmbeddingUseCases(
  embeddingProvider,
  vectorStore
);

export const astroRouter = new AstroRouter(embeddingAPI);

