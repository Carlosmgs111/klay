// src/lib/chunking/ChunkerFactory.ts

import { FixedSizeChunker } from "./strategies/FixedSizeChunker";
import { SentenceChunker } from "./strategies/SentenceChunker";
import { ParagraphChunker } from "./strategies/ParagraphChunker";
import { RecursiveChunker } from "./strategies/RecursiveChunker";
import { SemanticChunker } from "./strategies/SemanticChunker";
import type { ChunkingConfig } from "../@core-contracts/dtos";
import type { EmbeddingAPI } from "@/modules/embeddings/@core-contracts/api";

export class ChunkerFactory {
  constructor(private embeddingProvider?: EmbeddingAPI) {}
  create(config: ChunkingConfig) {
    console.log(config.strategy);
    if (!config.strategy) {
      throw new Error("Strategy is required");
    }
    const strategies = {
      fixed: () =>
        new FixedSizeChunker(
          config.chunkSize || 1000,
          config.chunkOverlap || 200
        ),
      sentence: () =>
        new SentenceChunker(
          config.maxChunkSize || 1000,
          config.chunkOverlap || 1
        ),
      paragraph: () =>
        new ParagraphChunker(
          config.maxChunkSize || 1500,
          config.minChunkSize || 100
        ),
      recursive: () =>
        new RecursiveChunker(
          config.chunkSize || 1000,
          config.chunkOverlap || 200,
          config.separators
        ),
      semantic: () => {
        if (!this.embeddingProvider) {
          throw new Error("EmbeddingProvider required for semantic chunking");
        }
        return new SemanticChunker(
          this.embeddingProvider!,
          config.maxChunkSize || 1000
        );
      },
    };
    if (!strategies[config.strategy]) {
      throw new Error(`Unknown chunking strategy: ${config.strategy}`);
    }
    return strategies[config.strategy]();
  }
}
