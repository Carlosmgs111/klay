import type { SemanticUnitInfrastructurePolicy } from "../../semantic-unit/composition/infra-policies";
import type { LineageInfrastructurePolicy } from "../../lineage/composition/infra-policies";
import type { SemanticUnitUseCases } from "../../semantic-unit/application/index";
import type { LineageUseCases } from "../../lineage/application/index";
import type { SemanticUnitRepository } from "../../semantic-unit/domain/SemanticUnitRepository";
import type { KnowledgeLineageRepository } from "../../lineage/domain/KnowledgeLineageRepository";

// ─── Facade Policy ───────────────────────────────────────────────────────────

export type SemanticKnowledgeInfraPolicy = "in-memory" | "browser" | "server";

export interface SemanticKnowledgeFacadePolicy {
  type: SemanticKnowledgeInfraPolicy;
  /**
   * Database path for server-side persistence (NeDB).
   * @default "./data"
   */
  dbPath?: string;
  /**
   * Database name for browser-side persistence (IndexedDB).
   * @default "semantic-knowledge"
   */
  dbName?: string;
  /**
   * Override policies for individual modules.
   * If not provided, modules inherit from the facade's type.
   */
  overrides?: {
    semanticUnit?: Partial<SemanticUnitInfrastructurePolicy>;
    lineage?: Partial<LineageInfrastructurePolicy>;
  };
  /**
   * Configuration overrides for testing or explicit configuration.
   * When provided, these values take precedence over environment variables.
   *
   * @example
   * ```typescript
   * configOverrides: {
   *   KLAY_DB_PATH: "/tmp/test",
   * }
   * ```
   */
  configOverrides?: Record<string, string>;
}

// ─── Resolved Modules ────────────────────────────────────────────────────────

export interface ResolvedSemanticKnowledgeModules {
  semanticUnit: SemanticUnitUseCases;
  lineage: LineageUseCases;
  /** Repository exposed for facade coordination */
  semanticUnitRepository: SemanticUnitRepository;
  /** Repository exposed for facade coordination */
  lineageRepository: KnowledgeLineageRepository;
}
