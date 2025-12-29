import type { ChunkingApi } from "./@core-contracts/api";
import { embeddingAPI } from "../embeddings";
import { ChunkerFactory } from "./domain/ChunkerFactory";
import { UseCases } from "./application/UseCases";
import { AstroRouter } from "./infrastructure/AstroRouter";

const chunkerFactory = new ChunkerFactory(embeddingAPI);

export const chunkingApi: ChunkingApi = new UseCases(chunkerFactory);
export const chunkingRouter = new AstroRouter(chunkingApi);
