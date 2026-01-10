import type { Storage } from "../../@core-contracts/storage";
import type { Repository } from "../../@core-contracts/repositories";
import type { FilesInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class FilesInfrastructureResolver {
  static async resolve(policy: FilesInfrastructurePolicy): Promise<{
    storage: Storage;
    repository: Repository;
  }> {
    return {
      storage: await FilesInfrastructureResolver.resolveStorage(policy.storage),
      repository: await FilesInfrastructureResolver.resolveRepository(
        policy.repository
      ),
    };
  }

  private static async resolveStorage(
    type: FilesInfrastructurePolicy["storage"]
  ): Promise<Storage> {
    const resolverTypes = {
      "local-fs": async () => {
        const { LocalFsStorage } = await import("../storage/LocalFsStorage");
        return new LocalFsStorage();
      },
      browser: async () => {
        const { BrowserStorage } = await import("../storage/BrowserStorage");
        return new BrowserStorage();
      },
      "browser-mock": async () => {
        const { BrowserMockStorage } = await import(
          "../storage/BrowserMockStorage"
        );
        return new BrowserMockStorage();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported storage: ${type}`);
    }
    return resolverTypes[type]();
  }

  private static async resolveRepository(
    type: FilesInfrastructurePolicy["repository"]
  ): Promise<Repository> {
    const resolverTypes = {
      csv: async () => {
        const { LocalCsvRepository } = await import(
          "../repository/LocalCsvRepository"
        );
        return new LocalCsvRepository();
      },
      browser: async () => {
        const { BrowserRepository } = await import(
          "../repository/BrowserRepository"
        );
        return new BrowserRepository();
      },
    };

    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
}
