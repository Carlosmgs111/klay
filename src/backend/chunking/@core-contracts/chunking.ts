export interface ChunkMetadata {
  source: string;
  chunkIndex: number;
  totalChunks: number;
  startPosition: number;
  endPosition: number;
  tokens?: number;
  [key: string]: any;
}

export interface Chunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkingStrategy {
  chunk(text: string, metadata?: Partial<ChunkMetadata>): Chunk[] | Promise<Chunk[]>;
}

export type ChunkingStrategyType = "fixed" | "sentence" | "paragraph" | "semantic" | "recursive";

export interface ChunkingConfig {
  strategy: ChunkingStrategyType;
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
  minChunkSize?: number;
  maxChunkSize?: number;
}

export interface ChunkerFactory {
  create(config: ChunkingConfig): ChunkingStrategy;
}
