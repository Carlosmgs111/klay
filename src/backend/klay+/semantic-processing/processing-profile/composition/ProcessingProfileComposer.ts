import type {
  ProcessingProfileInfrastructurePolicy,
  ResolvedProcessingProfileInfra,
} from "./infra-policies";
import type { ProcessingProfileRepository } from "../domain/ProcessingProfileRepository";

export class ProcessingProfileComposer {
  static async resolve(
    policy: ProcessingProfileInfrastructurePolicy,
  ): Promise<ResolvedProcessingProfileInfra> {
    const repository = await this.resolveRepository(policy);
    return { repository };
  }

  private static async resolveRepository(
    policy: ProcessingProfileInfrastructurePolicy,
  ): Promise<ProcessingProfileRepository> {
    switch (policy.type) {
      case "in-memory": {
        const { InMemoryProcessingProfileRepository } = await import(
          "../infrastructure/persistence/InMemoryProcessingProfileRepository"
        );
        return new InMemoryProcessingProfileRepository();
      }

      case "browser": {
        const { IndexedDBProcessingProfileRepository } = await import(
          "../infrastructure/persistence/indexeddb/IndexedDBProcessingProfileRepository"
        );
        const dbName = policy.dbName ?? "knowledge-platform";
        return new IndexedDBProcessingProfileRepository(dbName);
      }

      case "server": {
        const { NeDBProcessingProfileRepository } = await import(
          "../infrastructure/persistence/nedb/NeDBProcessingProfileRepository"
        );
        const filename = policy.dbPath
          ? `${policy.dbPath}/processing-profiles.db`
          : undefined;
        return new NeDBProcessingProfileRepository(filename);
      }

      default:
        throw new Error(`Unknown policy type: ${(policy as any).type}`);
    }
  }
}
