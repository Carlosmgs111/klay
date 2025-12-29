// src/lib/chunking/RecursiveChunker.ts

import { BaseChunker } from './BaseChunker';
import type { Chunk, ChunkMetadata } from '../../@core-contracts/entities';

export class RecursiveChunker extends BaseChunker {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(
    chunkSize: number = 1000,
    chunkOverlap: number = 200,
    separators: string[] = ['\n\n', '\n', '. ', ' ', '']
  ) {
    super();
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.separators = separators;
  }

  async chunk(text: string, metadata?: Partial<ChunkMetadata>): Promise<Chunk[]> {
    const splits = this.recursiveSplit(text, this.separators);
    return this.mergeChunks(splits, metadata);
  }

  private recursiveSplit(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];

    // Caso base: no quedan separadores
    if (separators.length === 0) {
      return [text];
    }

    const separator = separators[0];
    const newSeparators = separators.slice(1);

    // Dividir por el separador actual
    const splits = text.split(separator);

    for (const split of splits) {
      if (split.length === 0) continue;

      if (split.length <= this.chunkSize) {
        finalChunks.push(split);
      } else {
        // Recursión con el siguiente separador
        const subChunks = this.recursiveSplit(split, newSeparators);
        finalChunks.push(...subChunks);
      }
    }

    return finalChunks;
  }

  private async mergeChunks(
    splits: string[],
    metadata?: Partial<ChunkMetadata>
  ): Promise<Chunk[]> {
    const chunks: Chunk[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;
    let chunkIndex = 0;
    let startPos = 0;

    for (const split of splits) {
      const splitLength = split.length;

      if (currentLength + splitLength > this.chunkSize && currentChunk.length > 0) {
        const content = currentChunk.join('');
        const endPos = startPos + content.length;

        chunks.push(
          await this.createChunk(content, chunkIndex, 0, startPos, endPos, {
            ...metadata,
            tokens: this.estimateTokens(content),
          })
        );

        // Overlap
        const overlapText = content.slice(-this.chunkOverlap);
        currentChunk = [overlapText];
        currentLength = overlapText.length;
        startPos = endPos - this.chunkOverlap;
        chunkIndex++;
      }

      currentChunk.push(split);
      currentLength += splitLength;
    }

    // Último chunk
    if (currentChunk.length > 0) {
      const content = currentChunk.join('');
      const endPos = startPos + content.length;

      chunks.push(
        await this.createChunk(content, chunkIndex, 0, startPos, endPos, {
          ...metadata,
          tokens: this.estimateTokens(content),
        })
      );
    }

    // Actualizar totalChunks
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }
}