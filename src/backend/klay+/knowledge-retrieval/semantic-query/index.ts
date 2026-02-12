// ─── Domain ────────────────────────────────────────────────────────
export { Query, QueryId, RetrievalResult, RetrievalItem } from "./domain/index.js";

export type {
  VectorSearchAdapter,
  SearchHit,
  RankingStrategy,
  RankedHit,
  QueryEmbedder,
} from "./domain/index.js";

// ─── Application ───────────────────────────────────────────────────
export { ExecuteSemanticQuery, SemanticQueryUseCases } from "./application/index.js";
export type { ExecuteSemanticQueryCommand } from "./application/index.js";

// ─── Infrastructure ────────────────────────────────────────────────
export {
  HashQueryEmbedder,
  WebLLMQueryEmbedder,
  AISdkQueryEmbedder,
  InMemoryVectorSearchAdapter,
  PassthroughRankingStrategy,
} from "./infrastructure/adapters/index.js";

// ─── Composition ───────────────────────────────────────────────────
export {
  SemanticQueryComposer,
  semanticQueryFactory,
} from "./composition/index.js";

export type {
  SemanticQueryInfraPolicy,
  SemanticQueryInfrastructurePolicy,
  ResolvedSemanticQueryInfra,
  SemanticQueryFactoryResult,
} from "./composition/index.js";
