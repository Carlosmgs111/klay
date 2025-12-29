// src/lib/chunking/SemanticChunker.ts

import { BaseChunker } from "./BaseChunker";
import type { Chunk, ChunkMetadata } from "../../@core-contracts/entities";
import type { EmbeddingAPI } from "@/modules/embeddings/@core-contracts/api";

export class SemanticChunker extends BaseChunker {
  private embeddingProvider: EmbeddingAPI;
  private maxChunkSize: number;
  private similarityThreshold: number;

  constructor(
    embeddingProvider: EmbeddingAPI,
    maxChunkSize: number = 1000,
    similarityThreshold: number = 0.7
  ) {
    super();
    this.embeddingProvider = embeddingProvider;
    this.maxChunkSize = maxChunkSize;
    this.similarityThreshold = similarityThreshold;
  }

  async chunk(
    text: string,
    metadata?: Partial<ChunkMetadata>
  ): Promise<Chunk[]> {
    // Dividir en oraciones
    const sentences = this.splitIntoSentences(text);

    if (sentences.length === 0) return [];

    // Generar embeddings para cada oración
    const embeddings = await Promise.all(
      sentences.map((s) => this.embeddingProvider.generateEmbeddings([s]))
    );

    // Calcular similitudes entre oraciones consecutivas
    const similarities: number[] = [];
    for (let i = 0; i < embeddings.length - 1; i++) {
      const similarity = this.cosineSimilarity(
        embeddings[i][0].embedding,
        embeddings[i + 1][0].embedding
      );
      similarities.push(similarity);
    }

    // Encontrar puntos de división (baja similitud)
    const breakpoints: number[] = [0];
    for (let i = 0; i < similarities.length; i++) {
      if (similarities[i] < this.similarityThreshold) {
        breakpoints.push(i + 1);
      }
    }
    breakpoints.push(sentences.length);

    // Crear chunks basados en breakpoints
    const chunks: Chunk[] = [];
    let chunkIndex = 0;
    let startPos = 0;

    for (let i = 0; i < breakpoints.length - 1; i++) {
      const start = breakpoints[i];
      const end = breakpoints[i + 1];
      const chunkSentences = sentences.slice(start, end);
      let content = chunkSentences.join(" ");

      // Si el chunk es muy grande, dividirlo
      if (content.length > this.maxChunkSize) {
        const subChunks = this.splitLargeChunk(chunkSentences);
        for (const subContent of subChunks) {
          const endPos = startPos + subContent.length;
          chunks.push(
            await this.createChunk(
              subContent,
              chunkIndex,
              0,
              startPos,
              endPos,
              {
                ...metadata,
                tokens: this.estimateTokens(subContent),
                semantic: true,
              }
            )
          );
          startPos = endPos;
          chunkIndex++;
        }
      } else {
        const endPos = startPos + content.length;
        chunks.push(
          await this.createChunk(content, chunkIndex, 0, startPos, endPos, {
            ...metadata,
            tokens: this.estimateTokens(content),
            semantic: true,
          })
        );
        startPos = endPos;
        chunkIndex++;
      }
    }

    // Actualizar totalChunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  private splitLargeChunk(sentences: string[]): string[] {
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const sentence of sentences) {
      if (
        currentLength + sentence.length > this.maxChunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [];
        currentLength = 0;
      }
      currentChunk.push(sentence);
      currentLength += sentence.length + 1;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
    }

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    const sentenceRegex = /[^.!?]+[.!?]+["']?|[^.!?]+$/g;
    const matches = text.match(sentenceRegex) || [];
    return matches.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}
