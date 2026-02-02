/*
 * This is module will process the documents and extract the text from them
 * - Extract text from buffer
 * - Clean extracted text
 * - Manage cleaned text in database
 */
import { UseCases } from "./application/UseCases";
import type { TextExtractionInfrastructurePolicy } from "./composition/infra-policies";
import { TextInfrastructureComposer } from "./composition/Composer";

export async function textExtractorApiFactory(
  policy: TextExtractionInfrastructurePolicy
): Promise<UseCases> {
  const { extractor, repository } = await TextInfrastructureComposer.resolve(policy);
  return new UseCases(extractor, repository);
}

// export const textsRouter = new AstroRouter(textExtractorApiFactory);
