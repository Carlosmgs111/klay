import type { Chunk } from "@xenova/transformers";

export class ChunkingStrategy {
  fragment(
    text: string,
    metadata?: Record<string, any>
  ): Chunk[] | Promise<Chunk[]> {
    throw new Error("Method not implemented.");
  }
}
