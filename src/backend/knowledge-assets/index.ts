/*
 * this module will manage the knowledge assets
 * - manage files
 * - manage text-extraction
 * - manage chunking
 * - manage embeddings
 */
import type { KnowledgeAssetsAPI } from "./@core-contracts/api";
import type { KnowledgeAssetsInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
import { UseCases } from "./application/UseCases";
import { KnowledgeAssetsInfrastructureResolver } from "./infrastructure/composition/Resolver";
// import { AstroRouter } from "./infrastructure/routes/AstroRouter";

export async function knowledgeAssetsApiFactory(
  policy: KnowledgeAssetsInfrastructurePolicy
): Promise<KnowledgeAssetsAPI> {
  const { 
    repository, 
    filesApi, 
    textExtractorApi, 
    chunkingApi, 
    embeddingApi 
  } = await KnowledgeAssetsInfrastructureResolver.resolve(policy);

  return new UseCases(
    filesApi,
    textExtractorApi,
    chunkingApi,
    embeddingApi,
    repository
  );
}

// export const knowledgeAssetsRouter = new AstroRouter(knowledgeAssetsApiFactory);
