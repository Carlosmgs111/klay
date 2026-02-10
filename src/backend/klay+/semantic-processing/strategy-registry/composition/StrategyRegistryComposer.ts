import type {
  StrategyRegistryInfrastructurePolicy,
  ResolvedStrategyRegistryInfra,
} from "./infra-policies";
import type { ProcessingStrategyRepository } from "../domain/ProcessingStrategyRepository";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

/**
 * Composer for the Strategy Registry Module.
 *
 * Responsible for resolving infrastructure dependencies based on policy.
 * Each aspect (repository, publisher) has its own resolver method.
 */
export class StrategyRegistryComposer {
  // ─── Repository Resolution ────────────────────────────────────────────────

  private static async resolveRepository(
    policy: StrategyRegistryInfrastructurePolicy,
  ): Promise<ProcessingStrategyRepository> {
    switch (policy.type) {
      case "in-memory": {
        const { InMemoryProcessingStrategyRepository } = await import(
          "../infrastructure/persistence/InMemoryProcessingStrategyRepository"
        );
        return new InMemoryProcessingStrategyRepository();
      }

      case "browser": {
        const { IndexedDBProcessingStrategyRepository } = await import(
          "../infrastructure/persistence/indexeddb/IndexedDBProcessingStrategyRepository"
        );
        const dbName = policy.dbName ?? "knowledge-platform";
        return new IndexedDBProcessingStrategyRepository(dbName);
      }

      case "server": {
        const { NeDBProcessingStrategyRepository } = await import(
          "../infrastructure/persistence/nedb/NeDBProcessingStrategyRepository"
        );
        const filename = policy.dbPath
          ? `${policy.dbPath}/processing-strategies.db`
          : undefined;
        return new NeDBProcessingStrategyRepository(filename);
      }

      default:
        throw new Error(`Unknown policy type: ${(policy as any).type}`);
    }
  }

  // ─── Event Publisher Resolution ───────────────────────────────────────────

  private static async resolveEventPublisher(
    _policy: StrategyRegistryInfrastructurePolicy,
  ): Promise<EventPublisher> {
    // Currently all policies use InMemoryEventPublisher
    // This can be extended to support distributed publishers (Redis, Kafka, etc.)
    const { InMemoryEventPublisher } = await import(
      "../../../shared/infrastructure/InMemoryEventPublisher"
    );
    return new InMemoryEventPublisher();
  }

  // ─── Main Resolution ──────────────────────────────────────────────────────

  static async resolve(
    policy: StrategyRegistryInfrastructurePolicy,
  ): Promise<ResolvedStrategyRegistryInfra> {
    const [repository, eventPublisher] = await Promise.all([
      this.resolveRepository(policy),
      this.resolveEventPublisher(policy),
    ]);

    return { repository, eventPublisher };
  }
}
