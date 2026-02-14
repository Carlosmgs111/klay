// ─── Facade ──────────────────────────────────────────────────────────────────
export { SourceIngestionFacade } from "./SourceIngestionFacade";
export type {
  RegisterSourceSuccess,
  ExtractSourceSuccess,
  IngestAndExtractSuccess,
  IngestExtractAndReturnSuccess,
} from "./SourceIngestionFacade";

// ─── Composition ─────────────────────────────────────────────────────────────
export { SourceIngestionFacadeComposer } from "./composition/SourceIngestionFacadeComposer";
export type {
  SourceIngestionFacadePolicy,
  SourceIngestionInfraPolicy,
  ResolvedSourceIngestionModules,
} from "./composition/infra-policies";

// ─── Facade Factory ──────────────────────────────────────────────────────────
import type { SourceIngestionFacadePolicy } from "./composition/infra-policies";
import type { SourceIngestionFacade as _Facade } from "./SourceIngestionFacade";

/**
 * Factory function to create a fully configured SourceIngestionFacade.
 * This is the main entry point for consuming the Source Ingestion context.
 */
export async function createSourceIngestionFacade(
  policy: SourceIngestionFacadePolicy,
): Promise<_Facade> {
  const { SourceIngestionFacadeComposer } = await import(
    "./composition/SourceIngestionFacadeComposer"
  );
  const { SourceIngestionFacade } = await import("./SourceIngestionFacade");
  const modules = await SourceIngestionFacadeComposer.resolve(policy);
  return new SourceIngestionFacade(modules);
}
