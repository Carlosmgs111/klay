


export type ChunkingStrategyType = "fixed" | "sentence" | "paragraph" | "semantic" | "recursive";

export interface ChunkMetadata {
  sourceId: string;
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

export interface ChunkBatch {
  chunks: Chunk[];
  metadata: {
    originalLength: number;
    chunksCount: number;
    strategy: ChunkingStrategyType;
    processingTime: number;
  };
}
