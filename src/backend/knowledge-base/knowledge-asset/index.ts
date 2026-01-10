/*
 * This module is responsible for managing knowledge assets, its means all what represents a knowledge base as a asset.
 * - Generate knowledge assets from sources
 * - Manage knowledge assets in database
 * - Retrieve and delete knowledge assets
 */
import type { KnowledgeAssetApi } from "./@core-contracts/api";
import type { KnowledgeAssetInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
import { KnowledgeAssetUseCases } from "./application/UseCases";
import { KnowledgeAssetInfrastructureResolver } from "./infrastructure/composition/Resolver";

export async function knowledgeAssetApiFactory(
  policy: KnowledgeAssetInfrastructurePolicy
): Promise<KnowledgeAssetApi> {
  const { repository } = await KnowledgeAssetInfrastructureResolver.resolve(policy);
  return new KnowledgeAssetUseCases(repository);
}

export * from "./@core-contracts/api";
export * from "./@core-contracts/dtos";
export * from "./@core-contracts/entities";
export * from "./@core-contracts/infrastructurePolicies";