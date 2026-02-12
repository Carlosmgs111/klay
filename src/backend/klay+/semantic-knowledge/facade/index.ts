// ─── Facade ──────────────────────────────────────────────────────────────────
export {
  SemanticKnowledgeFacade,
  SemanticUnitNotFoundError,
  SemanticUnitAlreadyExistsError,
  SemanticUnitOperationError,
  LineageNotFoundError,
  LineageOperationError,
} from "./SemanticKnowledgeFacade";

export type {
  CreateSemanticUnitWithLineageSuccess,
  VersionSemanticUnitWithLineageSuccess,
  DeprecateSemanticUnitWithLineageSuccess,
} from "./SemanticKnowledgeFacade";

// ─── Composition ─────────────────────────────────────────────────────────────
export { SemanticKnowledgeFacadeComposer } from "./composition/SemanticKnowledgeFacadeComposer";
export type {
  SemanticKnowledgeFacadePolicy,
  SemanticKnowledgeInfraPolicy,
  ResolvedSemanticKnowledgeModules,
} from "./composition/infra-policies";

// ─── Facade Factory ──────────────────────────────────────────────────────────
import type { SemanticKnowledgeFacadePolicy } from "./composition/infra-policies";
import type { SemanticKnowledgeFacade as _Facade } from "./SemanticKnowledgeFacade";

/**
 * Factory function to create a fully configured SemanticKnowledgeFacade.
 * This is the main entry point for consuming the Semantic Knowledge context.
 */
export async function createSemanticKnowledgeFacade(
  policy: SemanticKnowledgeFacadePolicy
): Promise<_Facade> {
  const { SemanticKnowledgeFacadeComposer } = await import(
    "./composition/SemanticKnowledgeFacadeComposer"
  );
  const { SemanticKnowledgeFacade } = await import("./SemanticKnowledgeFacade");
  const modules = await SemanticKnowledgeFacadeComposer.resolve(policy);
  return new SemanticKnowledgeFacade(modules);
}
