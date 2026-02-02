export class ChunkingStrategy {
  id: string;
  chunkingSize: number;
  chunkingOverlap: number;
  version: string;
  constructor(
    id: string,
    chunkingSize: number,
    chunkingOverlap: number,
    version: string
  ) {
    this.id = id;
    this.chunkingSize = chunkingSize;
    this.chunkingOverlap = chunkingOverlap;
    this.version = version;
  }
}
