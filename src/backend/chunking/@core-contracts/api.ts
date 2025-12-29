import type { ChunkingConfig } from "./dtos";
import type { ChunkMetadata, ChunkBatch } from "./entities";

export interface ChunkingApi {
  chunkOne(
    text: string,
    config: ChunkingConfig,
    documentMetadata?: Partial<ChunkMetadata>
  ): Promise<ChunkBatch>;
  chunkMultiple(
    documents: Array<{ text: string; metadata?: Partial<ChunkMetadata> }>,
    config: ChunkingConfig
  ): Promise<ChunkBatch[]>;
}
