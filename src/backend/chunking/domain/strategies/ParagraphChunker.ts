// src/lib/chunking/ParagraphChunker.ts

import { BaseChunker } from './BaseChunker';
import type { Chunk, ChunkMetadata } from '../../@core-contracts/entities';

export class ParagraphChunker extends BaseChunker {
  private maxChunkSize: number;
  private minChunkSize: number;

  constructor(maxChunkSize: number = 1500, minChunkSize: number = 100) {
    super();
    this.maxChunkSize = maxChunkSize;
    this.minChunkSize = minChunkSize;
  }

  async chunk(text: string, metadata?: Partial<ChunkMetadata>): Promise<Chunk[]> {
    const paragraphs = this.splitIntoParagraphs(text);
    const chunks: Chunk[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;
    let chunkIndex = 0;
    let startPos = 0;

    for (const paragraph of paragraphs) {
      const paragraphLength = paragraph.length;

      // Si el párrafo solo excede el máximo, dividirlo
      if (paragraphLength > this.maxChunkSize) {
        // Guardar chunk actual si existe
        if (currentChunk.length > 0) {
          const content = currentChunk.join('\n\n');
          const endPos = startPos + content.length;

          chunks.push(
            await this.createChunk(content, chunkIndex, 0, startPos, endPos, {
              ...metadata,
              tokens: this.estimateTokens(content),
            })
          );

          startPos = endPos;
          chunkIndex++;
          currentChunk = [];
          currentLength = 0;
        }

        // Dividir párrafo largo por oraciones
        const { SentenceChunker } = await import('./SentenceChunker');
        const sentenceChunker = new SentenceChunker(this.maxChunkSize);
        const subChunks = await sentenceChunker.chunk(paragraph, metadata);

        // FIX: Usar for...of en lugar de forEach para manejar async correctamente
        for (const subChunk of subChunks) {
          chunks.push(
            await this.createChunk(
              subChunk.content,
              chunkIndex,
              0,
              startPos,
              startPos + subChunk.content.length,
              {
                ...metadata,
                tokens: this.estimateTokens(subChunk.content),
              }
            )
          );
          startPos += subChunk.content.length;
          chunkIndex++;
        }

        continue;
      }

      // Si añadir este párrafo excede el máximo, crear nuevo chunk
      if (currentLength + paragraphLength > this.maxChunkSize && currentChunk.length > 0) {
        const content = currentChunk.join('\n\n');
        const endPos = startPos + content.length;

        chunks.push(
          await this.createChunk(content, chunkIndex, 0, startPos, endPos, {
            ...metadata,
            tokens: this.estimateTokens(content),
          })
        );

        startPos = endPos;
        chunkIndex++;
        currentChunk = [];
        currentLength = 0;
      }

      currentChunk.push(paragraph);
      currentLength += paragraphLength + 2; // +2 por \n\n
    }

    // Añadir último chunk
    if (currentChunk.length > 0) {
      const content = currentChunk.join('\n\n');
      const endPos = startPos + content.length;

      chunks.push(
        await this.createChunk(content, chunkIndex, 0, startPos, endPos, {
          ...metadata,
          tokens: this.estimateTokens(content),
        })
      );
    }

    // Filtrar chunks muy pequeños
    const filteredChunks = chunks.filter(
      chunk => chunk.content.length >= this.minChunkSize
    );

    // Actualizar totalChunks
    filteredChunks.forEach(chunk => {
      chunk.metadata.totalChunks = filteredChunks.length;
    });

    return filteredChunks;
  }

  private splitIntoParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }
}