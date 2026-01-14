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

export async function knowledgeAssetsApiFactory(
  policy: KnowledgeAssetsInfrastructurePolicy
): Promise<KnowledgeAssetsAPI> {
  const { knowledgeAssetApi } = await KnowledgeAssetsInfrastructureResolver.resolve(policy);

  return new UseCases(
    knowledgeAssetApi
  );  
}

