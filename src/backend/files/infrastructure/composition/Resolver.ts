import type { Storage } from "../../@core-contracts/storage";
import type { Repository } from "../../@core-contracts/repositories";
import type { FilesInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

import { LocalFsStorage } from "../storage/LocalFsStorage";
import { LocalCsvRepository } from "../repository/LocalCsvRepository";
import { BrowserStorage } from "../storage/BrowserStorage";

export class FilesInfrastructureResolver {
  static resolve(policy: FilesInfrastructurePolicy): {
    storage: Storage;
    repository: Repository;
  } {
    return {
      storage: FilesInfrastructureResolver.resolveStorage(policy.storage),
      repository: FilesInfrastructureResolver.resolveRepository(policy.repository),
    };
  }

  private static resolveStorage(type: FilesInfrastructurePolicy["storage"]): Storage {
    const storages = {
      "local-fs": new LocalFsStorage(),
      "browser": new BrowserStorage(),
    };
    if (!storages[type]) {
      throw new Error(`Unsupported storage: ${type}`);
    }
    return storages[type];
  }

  private static resolveRepository(
    type: FilesInfrastructurePolicy["repository"]
  ): Repository {
    const repositories = {
      "csv": new LocalCsvRepository(),
    };
    if (!repositories[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return repositories[type];
  }
}
