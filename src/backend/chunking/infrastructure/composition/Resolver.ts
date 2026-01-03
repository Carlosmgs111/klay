import type { ChunkingInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import { ChunkerFactory } from "../../domain/ChunkerFactory";
import type { BaseChunker } from "../../domain/strategies/BaseChunker";

export class ChunkingInfrastructureResolver {
  static resolve(policy: ChunkingInfrastructurePolicy): {
    chunker: BaseChunker;
  } {
    return {
      chunker: ChunkingInfrastructureResolver.resolveChunker(policy.strategy),
    };
  }

  private static resolveChunker(
    type: ChunkingInfrastructurePolicy["strategy"]
  ): BaseChunker {
    const chunkers = {
      fixed: new ChunkerFactory().create({ strategy: "fixed" }),
      paragraph: new ChunkerFactory().create({ strategy: "paragraph" }),
      semantic: new ChunkerFactory().create({ strategy: "semantic" }),
      recursive: new ChunkerFactory().create({ strategy: "recursive" }),
      sentence: new ChunkerFactory().create({ strategy: "sentence" }),
    };
    if (!chunkers[type]) {
      throw new Error(`Unsupported chunker: ${type}`);
    }
    return chunkers[type];
  }
}
