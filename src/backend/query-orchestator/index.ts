import type { QueryOrchestatorApi } from "./@core-contracts/api";
import { aiApi } from "../agents";
import { knowledgeAssetsApiFactory } from "@/modules/knowledge-base/orchestrator";
import { UseCases } from "./application/UseCases";
// import { AstroRouter } from "./infrastructure/AstroRouter";

const knowledgeAssetsApi = await knowledgeAssetsApiFactory({
  filesPolicy: {
    storage: "browser-fs",
    repository: "idb",
  },
  textExtractionPolicy: {
    extractor: "pdf",
    repository: "idb",
  },
  chunkingPolicy: {
    strategy: "fixed",
  },
  embeddingsPolicy: {
    provider: "browser-hf",
    repository: "idb",
  },
  knowledgeAssetPolicy: {
    repository: "idb",
    aiProvider: "web-llm",
  },
});

export const orchestatorApi: QueryOrchestatorApi = new UseCases(
  knowledgeAssetsApi,
  aiApi
);
// export const router = new AstroRouter(orchestatorApi);
