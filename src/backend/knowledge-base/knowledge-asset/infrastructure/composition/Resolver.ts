import type { KnowledgeAssetInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import type { KnowledgeAssetsRepository } from "../../@core-contracts/repositories";

export class KnowledgeAssetInfrastructureResolver {
  static async resolve(policy: KnowledgeAssetInfrastructurePolicy): Promise<{
    repository: KnowledgeAssetsRepository;
  }> {
    return {
      repository: await KnowledgeAssetInfrastructureResolver.resolveRepository(policy.repository),
    };
  }

  private static async resolveRepository(
    type: KnowledgeAssetInfrastructurePolicy["repository"]
  ): Promise<KnowledgeAssetsRepository> {
    const resolverTypes = {
      "local-level": async () => {
        const { LocalLevelRepository } = await import("../repositories/LocalLevelRepository");
        return new LocalLevelRepository();
      },
      browser: async () => {
        const { BrowserRepository } = await import("../repositories/BrowserRepository");
        return new BrowserRepository();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
}
