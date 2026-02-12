/**
 * Semantic Query Module Factory
 *
 * Entry point for creating the Semantic Query module.
 * Uses Composer for infrastructure resolution, then constructs UseCases.
 *
 * @example
 * ```typescript
 * const { useCases, infra } = await semanticQueryFactory({
 *   type: "in-memory",
 *   vectorStoreRef: myVectorStore,
 * });
 * await useCases.executeSemanticQuery.execute({ text: "query" });
 * ```
 */

import type {
  SemanticQueryInfrastructurePolicy,
  ResolvedSemanticQueryInfra,
} from "./infra-policies.js";
import type { SemanticQueryUseCases } from "../application/index.js";

// ─── Factory Result Contract ─────────────────────────────────────────────────

export interface SemanticQueryFactoryResult {
  /** Assembled use cases ready for consumption */
  useCases: SemanticQueryUseCases;
  /**
   * Resolved infrastructure.
   * Exposed for facade coordination (e.g., embedder or vector search access).
   * Should NOT be used directly by external consumers.
   */
  infra: ResolvedSemanticQueryInfra;
}

// ─── Factory Function ────────────────────────────────────────────────────────

export async function semanticQueryFactory(
  policy: SemanticQueryInfrastructurePolicy,
): Promise<SemanticQueryFactoryResult> {
  // 1. Resolve infrastructure via Composer (wiring only)
  const { SemanticQueryComposer } = await import("./SemanticQueryComposer.js");
  const infra = await SemanticQueryComposer.resolve(policy);

  // 2. Construct use cases with resolved dependencies
  const { SemanticQueryUseCases } = await import("../application/index.js");
  const useCases = new SemanticQueryUseCases(
    infra.queryEmbedder,
    infra.vectorSearch,
    infra.rankingStrategy,
  );

  return { useCases, infra };
}
