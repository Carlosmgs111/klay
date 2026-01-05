/*
 * This module chunk text
 * - Chunk text 
 * - Manage chunks in database
 */

import type { ChunkingApi } from "./@core-contracts/api";
import type { ChunkingInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
import { embeddingApiFactory } from "../embeddings";
import { ChunkerFactory } from "./domain/ChunkerFactory";
import { UseCases } from "./application/UseCases";
// import { AstroRouter } from "./infrastructure/AstroRouter";
// import { ChunkingInfrastructureResolver } from "./infrastructure/composition/Resolver";

export const embeddingAPI = await embeddingApiFactory({
  provider: "openai",
  repository: "local-level",
});

export function chunkingApiFactory(
  policy: ChunkingInfrastructurePolicy
): ChunkingApi {
  // const { chunker } = ChunkingInfrastructureResolver.resolve(policy);
  const chunkerFactory = new ChunkerFactory(embeddingAPI);
  return new UseCases(chunkerFactory);
}

// export const chunkingRouter = new AstroRouter(chunkingApiFactory);
