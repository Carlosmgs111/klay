import type { Storage } from "../../@core-contracts/storage";
import type { Repository } from "../../@core-contracts/repositories";
import type { FilesInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class FilesInfrastructureResolver {
  static async resolve(policy: FilesInfrastructurePolicy): Promise<{
    storage: Storage;
    repository: Repository;
  }> {
    console.log({ policy });
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
      "node-fs": async () => {
        const { NodeFsStorage } = await import("../storage/NodeFsStorage");
        return new NodeFsStorage();
      },
      "browser-fs": async () => {
        const { BrowserFsStorage } = await import("../storage/BrowserFsStorage");
        return new BrowserFsStorage();
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
      idb: async () => {
        const { IDBRepository } = await import(
          "../repository/IDBRepository"
        );
        return new IDBRepository();
      },
      leveldb: async () => {
        const { LevelDBRepository } = await import(
          "../repository/LevelDBRepository"
        );
        return new LevelDBRepository();
      },
    };

    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
}
