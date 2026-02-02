// domain/chunking/Chunk.ts
export class Chunk {
  constructor(
    readonly content: string,
    readonly index: number,
    readonly metadata: Record<string, any>
  ) {}
}
