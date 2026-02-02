import { EmbeddingStrategy } from "./EmbeddingStrategy";
import { ChunkingStrategy } from "./ChunkingStrategy";

export class Strategy {
  id: string;
  embeddingStrategy: EmbeddingStrategy;
  chunkingStrategy: ChunkingStrategy;
  constructor(
    id: string,
    embeddingStrategy: EmbeddingStrategy,
    chunkingStrategy: ChunkingStrategy
  ) {
    this.id = id;
    this.embeddingStrategy = embeddingStrategy;
    this.chunkingStrategy = chunkingStrategy;
  }
}
