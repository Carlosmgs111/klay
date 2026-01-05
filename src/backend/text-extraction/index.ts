/*
 * This is module will process the documents and extract the text from them
 * - Extract text from buffer
 * - Clean extracted text
 * - Manage cleaned text in database
 */
import type { TextExtractorApi } from "./@core-contracts/api";
import type { TextExtractionInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
// import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { UseCases } from "./application/UseCases";
import { TextExtractionInfrastructureResolver } from "./infrastructure/composition/Resolver";

export async function textExtractorApiFactory(
  policy: TextExtractionInfrastructurePolicy
): Promise<TextExtractorApi> {
  const { extractor, repository } = await TextExtractionInfrastructureResolver.resolve(policy);
  return new UseCases(extractor, repository);
}

// export const textsRouter = new AstroRouter(textExtractorApiFactory);
