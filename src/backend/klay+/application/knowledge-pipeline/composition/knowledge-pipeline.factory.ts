import type { KnowledgePipelinePort } from "../contracts/KnowledgePipelinePort";
import type { KnowledgePipelinePolicy } from "./KnowledgePipelineComposer";

/**
 * Factory function to create a fully configured KnowledgePipeline.
 *
 * This is the main entry point for consuming the orchestrator.
 * Returns ONLY the port — not the implementation, not the facades.
 *
 * Uses dynamic imports for tree-shaking.
 *
 * @example
 * ```typescript
 * const pipeline = await createKnowledgePipeline({ type: "server", dbPath: "./data" });
 * const result = await pipeline.execute({ ... });
 * ```
 */
export async function createKnowledgePipeline(
  policy: KnowledgePipelinePolicy,
): Promise<KnowledgePipelinePort> {
  const { KnowledgePipelineComposer } = await import(
    "./KnowledgePipelineComposer"
  );
  const { KnowledgePipelineOrchestrator } = await import(
    "../application/KnowledgePipelineOrchestrator"
  );

  const deps = await KnowledgePipelineComposer.resolve(policy);
  return new KnowledgePipelineOrchestrator(deps);
}
