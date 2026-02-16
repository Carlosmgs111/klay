import type {
  ProjectionInfrastructurePolicy,
  ResolvedProjectionInfra,
} from "./infra-policies";
import type { SemanticProjectionRepository } from "../domain/SemanticProjectionRepository";
import type { VectorWriteStore } from "../domain/ports/VectorWriteStore";
import type { EventPublisher } from "../../../../shared/domain/EventPublisher";
import type { ProcessingProfileRepository } from "../../processing-profile/domain/ProcessingProfileRepository";

/**
 * Composer for the Projection Module.
 *
 * Responsible for resolving infrastructure dependencies based on policy.
 *
 * Strategy resolution (embedding/chunking) is NO LONGER done at composition time —
 * it's delegated to ProcessingProfileMaterializer at runtime,
 * driven by the ProcessingProfile domain aggregate.
 */
export class ProjectionComposer {
  // ─── Repository Resolution ────────────────────────────────────────────────

  private static async resolveRepository(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<SemanticProjectionRepository> {
    switch (policy.type) {
      case "in-memory": {
        const { InMemorySemanticProjectionRepository } = await import(
          "../infrastructure/persistence/InMemorySemanticProjectionRepository"
        );
        return new InMemorySemanticProjectionRepository();
      }

      case "browser": {
        const { IndexedDBSemanticProjectionRepository } = await import(
          "../infrastructure/persistence/indexeddb/IndexedDBSemanticProjectionRepository"
        );
        const dbName = policy.dbName ?? "knowledge-platform";
        return new IndexedDBSemanticProjectionRepository(dbName);
      }

      case "server": {
        const { NeDBSemanticProjectionRepository } = await import(
          "../infrastructure/persistence/nedb/NeDBSemanticProjectionRepository"
        );
        const filename = policy.dbPath
          ? `${policy.dbPath}/semantic-projections.db`
          : undefined;
        return new NeDBSemanticProjectionRepository(filename);
      }

      default:
        throw new Error(`Unknown policy type: ${(policy as any).type}`);
    }
  }

  // ─── Vector Write Store Resolution ─────────────────────────────────────────

  private static async resolveVectorWriteStore(
    policy: ProjectionInfrastructurePolicy,
  ): Promise<VectorWriteStore> {
    switch (policy.type) {
      case "in-memory": {
        const { InMemoryVectorWriteStore } = await import(
          "../../../../platform/vector/InMemoryVectorWriteStore"
        );
        return new InMemoryVectorWriteStore();
      }

      case "browser": {
        const { IndexedDBVectorWriteStore } = await import(
          "../infrastructure/adapters/IndexedDBVectorWriteStore"
        );
        const dbName = policy.dbName ?? "knowledge-platform";
        return new IndexedDBVectorWriteStore(dbName);
      }

      case "server": {
        const { NeDBVectorWriteStore } = await import(
          "../infrastructure/adapters/NeDBVectorWriteStore"
        );
        const filename = policy.dbPath
          ? `${policy.dbPath}/vector-entries.db`
          : undefined;
        return new NeDBVectorWriteStore(filename);
      }

      default:
        throw new Error(`Unknown policy type: ${(policy as any).type}`);
    }
  }

  // ─── Event Publisher Resolution ───────────────────────────────────────────

  private static async resolveEventPublisher(
    _policy: ProjectionInfrastructurePolicy,
  ): Promise<EventPublisher> {
    const { InMemoryEventPublisher } = await import(
      "../../../../platform/eventing/InMemoryEventPublisher"
    );
    return new InMemoryEventPublisher();
  }

  // ─── Main Resolution ──────────────────────────────────────────────────────

  /**
   * Resolves projection infrastructure.
   *
   * Requires an externally-provided ProcessingProfileRepository
   * (from the processing-profile module factory) for cross-module wiring.
   *
   * Creates the ProcessingProfileMaterializer internally from the policy.
   */
  static async resolve(
    policy: ProjectionInfrastructurePolicy,
    profileRepository: ProcessingProfileRepository,
  ): Promise<ResolvedProjectionInfra> {
    const { ProcessingProfileMaterializer } = await import(
      "./ProcessingProfileMaterializer"
    );

    const [repository, vectorWriteStore, eventPublisher] = await Promise.all([
      this.resolveRepository(policy),
      this.resolveVectorWriteStore(policy),
      this.resolveEventPublisher(policy),
    ]);

    const materializer = new ProcessingProfileMaterializer(policy);

    return {
      repository,
      profileRepository,
      materializer,
      vectorWriteStore,
      eventPublisher,
    };
  }
}
