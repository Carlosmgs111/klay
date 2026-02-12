// ═══════════════════════════════════════════════════════════════════════════
// Semantic Query Module
// ═══════════════════════════════════════════════════════════════════════════
export {
  Query,
  QueryId,
  RetrievalResult,
  RetrievalItem,
  ExecuteSemanticQuery,
  SemanticQueryUseCases,
  SemanticQueryComposer,
  HashQueryEmbedder,
  WebLLMQueryEmbedder,
  AISdkQueryEmbedder,
  InMemoryVectorSearchAdapter,
  PassthroughRankingStrategy,
  semanticQueryFactory,
} from "./semantic-query/index.js";

export type {
  VectorSearchAdapter,
  SearchHit,
  RankingStrategy,
  RankedHit,
  QueryEmbedder,
  ExecuteSemanticQueryCommand,
  SemanticQueryInfrastructurePolicy,
  ResolvedSemanticQueryInfra,
  SemanticQueryFactoryResult,
} from "./semantic-query/index.js";

// ═══════════════════════════════════════════════════════════════════════════
// Facade Module (Recommended Entry Point)
// ═══════════════════════════════════════════════════════════════════════════
export {
  KnowledgeRetrievalFacade,
  KnowledgeRetrievalFacadeComposer,
  createKnowledgeRetrievalFacade,
} from "./facade/index.js";

export type {
  KnowledgeRetrievalFacadePolicy,
  KnowledgeRetrievalInfraPolicy,
  ResolvedKnowledgeRetrievalModules,
} from "./facade/index.js";
