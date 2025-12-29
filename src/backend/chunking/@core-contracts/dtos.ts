import type { ChunkMetadata, Chunk, ChunkingStrategyType } from "./entities";

export interface ChunkingStrategy {
  chunk(
    text: string,
    metadata?: Partial<ChunkMetadata>
  ): Chunk[] | Promise<Chunk[]>;
}

export interface ChunkingConfig {
  strategy: ChunkingStrategyType;
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
  minChunkSize?: number;
  maxChunkSize?: number;
}
