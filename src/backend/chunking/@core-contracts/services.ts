import type { ChunkingConfig, ChunkingStrategy } from "./dtos";

export interface ChunkerFactory {
  create(config: ChunkingConfig): ChunkingStrategy;
}
