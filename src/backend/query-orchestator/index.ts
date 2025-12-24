import type { QueryOrchestatorApi } from "./@core-contracts/api";
import { aiApi } from "../agents";
import { embeddingAPI } from "../embeddings";
import { UseCases } from "./application/UseCases";
import { AstroRouter } from "./infrastructure/AstroRouter";

export const orchestatorApi: QueryOrchestatorApi = new UseCases(
  embeddingAPI,
  aiApi
);
export const router = new AstroRouter(orchestatorApi);
