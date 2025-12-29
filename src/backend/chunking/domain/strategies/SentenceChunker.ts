// src/lib/chunking/SentenceChunker.ts

import { BaseChunker } from "./BaseChunker";
import type { Chunk, ChunkMetadata } from "../../@core-contracts/entities";

export class SentenceChunker extends BaseChunker {
  private maxChunkSize: number;
  private chunkOverlap: number;

  constructor(maxChunkSize: number = 1000, chunkOverlap: number = 1) {
    super();
    this.maxChunkSize = maxChunkSize;
    this.chunkOverlap = chunkOverlap; // Overlap en número de oraciones
  }

  async chunk(text: string, metadata?: Partial<ChunkMetadata>): Promise<Chunk[]> {
    const sentences = this.splitIntoSentences(text);
    const chunks: Chunk[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;
    let chunkIndex = 0;
    let startPos = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceLength = sentence.length;

      if (currentLength + sentenceLength > this.maxChunkSize && currentChunk.length > 0) {
        // Crear chunk
        const content = currentChunk.join(' ');
        const endPos = startPos + content.length;

        chunks.push(
          await this.createChunk(
            content,
            chunkIndex,
            0,
            startPos,
            endPos,
            {
              ...metadata,
              tokens: this.estimateTokens(content),
            }
          )
        );

        // Preparar siguiente chunk con overlap
        const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap);
        currentChunk = currentChunk.slice(overlapStart);
        currentLength = currentChunk.join(' ').length;
        startPos = endPos - currentLength;
        chunkIndex++;
      }

      currentChunk.push(sentence);
      currentLength += sentenceLength + 1; // +1 por el espacio
    }

    // Añadir último chunk si existe
    if (currentChunk.length > 0) {
      const content = currentChunk.join(' ');
      const endPos = startPos + content.length;

      chunks.push(
        await this.createChunk(
          content,
          chunkIndex,
          0,
          startPos,
          endPos,
          {
            ...metadata,
            tokens: this.estimateTokens(content),
          }
        )
      );
    }

    // Actualizar totalChunks
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Regex mejorado para detectar fin de oración
    const sentenceRegex = /[^.!?]+[.!?]+["']?|[^.!?]+$/g;
    const matches = text.match(sentenceRegex) || [];
    return matches.map(s => s.trim()).filter(s => s.length > 0);
  }
}