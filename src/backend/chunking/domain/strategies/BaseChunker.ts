// src/lib/chunking/BaseChunker.ts

import type { Chunk, ChunkMetadata } from "../../@core-contracts/entities";

export abstract class BaseChunker {
  protected generateChunkId(source: string, index: number): string {
    return `${source}-chunk-${index}-${Date.now()}`;
  }

   protected async createChunk(
    content: string,
    index: number,
    total: number,
    startPos: number,
    endPos: number,
    baseMetadata?: Partial<ChunkMetadata>
  ): Promise<Chunk> {
    const metadata: ChunkMetadata = {
      sourceId: baseMetadata?.sourceId || "unknown",
      chunkIndex: index,
      totalChunks: total,
      startPosition: startPos,
      endPosition: endPos,
      ...baseMetadata,
    };

    return {
      id: this.generateChunkId(metadata.sourceId, index),
      content: content.trim(),
      metadata,
    };
  }

  protected estimateTokens(text: string): number {
    // Estimación simple: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  abstract chunk(text: string, metadata?: Partial<ChunkMetadata>): Promise<Chunk[]>;
}
