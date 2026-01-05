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
      repository: await FilesInfrastructureResolver.resolveRepository(policy.repository),
    };
  }

  private static async resolveStorage(type: FilesInfrastructurePolicy["storage"]): Promise<Storage> {
    switch (type) {
      case "local-fs": {
        const { LocalFsStorage } = await import("../storage/LocalFsStorage");
        return new LocalFsStorage();
      }
      case "browser": {
        const { BrowserStorage } = await import("../storage/BrowserStorage");
        return new BrowserStorage();
      }
      default:
        throw new Error(`Unsupported storage: ${type}`);
    }
  }

  private static async resolveRepository(
    type: FilesInfrastructurePolicy["repository"]
  ): Promise<Repository> {
    switch (type) {
      case "csv": {
        const { LocalCsvRepository } = await import("../repository/LocalCsvRepository");
        return new LocalCsvRepository();
      }
      case "browser": {
        const { BrowserRepository } = await import("../repository/BrowserRepository");
        return new BrowserRepository();
      }
      default:
        throw new Error(`Unsupported repository: ${type}`);
    }
  }
}
