import type { AgentInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicy";
import type { AIProvider } from "../../@core-contracts/providers";
import type { AgentRepository } from "../../@core-contracts/repositories";

export class AgentInfrastructureResolver {
  static async resolve(policy: AgentInfrastructurePolicy): Promise<{
    provider: AIProvider;
    repository: AgentRepository;
  }> {
    return {
      provider: await AgentInfrastructureResolver.resolveProvider(
        policy.provider
      ),
      repository: await AgentInfrastructureResolver.resolveRepository(
        policy.repository
      ),
    };
  }

  private static resolveProvider(
    type: AgentInfrastructurePolicy["provider"]
  ): Promise<AIProvider> {
    const resolverTypes = {
      "vercel-ai": async () => {
        const { AISDKProvider } = await import("../AIProvider/AIProvider");
        return new AISDKProvider({
          model: "deepseek-ai/DeepSeek-V3-0324",
        })  ;
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported provider: ${type}`);
    }
    return resolverTypes[type]();
  }

  private static resolveRepository(
    type: AgentInfrastructurePolicy["repository"]
  ): Promise<AgentRepository> {
    const resolverTypes = {
      "leveldb": async () => {
        const { LocalLevelAgentRepository } = await import("../Repositories/LocalLevelAgentRepository");
        return new LocalLevelAgentRepository();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
}
