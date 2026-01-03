/*
 * this is module will genererate embeddings
 * - Process embeddings
 *   - Generate embeddings from text using LLM
 *   - Save embeddings in a vetorial database
 * - Recover embeddings
 */
import type { EmbeddingAPI } from "./@core-contracts/api";
import type { EmbeddingsInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
import { EmbeddingUseCases } from "./application/UseCases";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { EmbeddingsInfrastructureResolver } from "./infrastructure/composition/Resolver";

export function embeddingApiFactory(
  policy: EmbeddingsInfrastructurePolicy
): EmbeddingAPI {
  const { provider, repository } = EmbeddingsInfrastructureResolver.resolve(policy);
  return new EmbeddingUseCases(provider, repository);
}

export const astroRouter = new AstroRouter(embeddingApiFactory);

