// src/lib/chunking/FixedSizeChunker.ts

import { BaseChunker } from "./BaseChunker";
import type { Chunk, ChunkMetadata } from "../../@core-contracts/entities";

export class FixedSizeChunker extends BaseChunker {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    super();
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async chunk(text: string, metadata?: Partial<ChunkMetadata>): Promise<Chunk[]> {
    const chunks: Chunk[] = [];
    let startPos = 0;
    let chunkIndex = 0;

    while (startPos < text.length) {
      const endPos = Math.min(startPos + this.chunkSize, text.length);
      const content = text.slice(startPos, endPos);

      chunks.push(
        await this.createChunk(
          content,
          chunkIndex,
          0, // Se actualizará después
          startPos,
          endPos,
          {
            ...metadata,
            tokens: this.estimateTokens(content),
          }
        )
      );

      startPos += this.chunkSize - this.chunkOverlap;
      chunkIndex++;
    }

    // Actualizar totalChunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }
}
