// ─── Facade ─────────────────────────────────────────────────────────────────
export { SemanticProcessingFacade } from "./SemanticProcessingFacade";
export type {
  ProcessContentSuccess,
  CreateProfileSuccess,
  UpdateProfileSuccess,
  DeprecateProfileSuccess,
} from "./SemanticProcessingFacade";

// ─── Composition ────────────────────────────────────────────────────────────
export { SemanticProcessingFacadeComposer } from "./composition/SemanticProcessingFacadeComposer";
export type {
  SemanticProcessingFacadePolicy,
  SemanticProcessingInfraPolicy,
  ResolvedSemanticProcessingModules,
} from "./composition/infra-policies";

// ─── Facade Factory ─────────────────────────────────────────────────────────
import type { SemanticProcessingFacadePolicy } from "./composition/infra-policies";
import type { SemanticProcessingFacade as _Facade } from "./SemanticProcessingFacade";

/**
 * Factory function to create a fully configured SemanticProcessingFacade.
 * This is the main entry point for consuming the Semantic Processing context.
 */
export async function createSemanticProcessingFacade(
  policy: SemanticProcessingFacadePolicy,
): Promise<_Facade> {
  const { SemanticProcessingFacadeComposer } = await import(
    "./composition/SemanticProcessingFacadeComposer"
  );
  const { SemanticProcessingFacade } = await import("./SemanticProcessingFacade");
  const modules = await SemanticProcessingFacadeComposer.resolve(policy);
  return new SemanticProcessingFacade(modules);
}
