/*
 * this module will manage the knowledge assets
 * - manage files
 * - manage text-extraction
 * - manage chunking
 * - manage embeddings
 */
import { filesApi } from "../files";
import { textExtractorApi } from "../text-extraction";
import { chunkingApi } from "../chunking";
import { embeddingAPI } from "../embeddings";
import type { KnowledgeAssetsAPI } from "./@core-contracts/api";
import { UseCases } from "./application/UseCases";
import { LocalLevelRepository } from "./infraestructure/LocalLevelRepository";
import { AstroRouter } from "./infraestructure/AstroRouter";

export const knowledgeAssetsApi: KnowledgeAssetsAPI = new UseCases(
  filesApi,
  textExtractorApi,
  chunkingApi,
  embeddingAPI,
  new LocalLevelRepository()
);
export const knowledgeAssetsRouter = new AstroRouter(knowledgeAssetsApi);
