import type { TextExtractor } from "../../@core-contracts/services";
import type { Repository } from "../../@core-contracts/repositories";
import type { TextExtractionInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import { PDFTextExtractor } from "../extraction/PDFTextExtractor";
import { LocalLevelRepository } from "../repository/LocalLevelRepository";
import { BrowserRepository } from "../repository/BrowserRepository";

export class TextExtractionInfrastructureResolver {
  static resolve(policy: TextExtractionInfrastructurePolicy): {
    extractor: TextExtractor;
    repository: Repository;
  } {
    return {
      extractor: TextExtractionInfrastructureResolver.resolveExtractor(policy.extractor),
      repository: TextExtractionInfrastructureResolver.resolveRepository(policy.repository),
    };
  }

  private static resolveExtractor(
    type: TextExtractionInfrastructurePolicy["extractor"]
  ): TextExtractor {
    const extractors = {
      "pdf": new PDFTextExtractor(),
      "docx": new PDFTextExtractor(), // TODO: Create DocxTextExtractor
      "txt": new PDFTextExtractor(),  // TODO: Create TxtTextExtractor
    };
    if (!extractors[type]) {
      throw new Error(`Unsupported extractor: ${type}`);
    }
    return extractors[type];
  }

  private static resolveRepository(
    type: TextExtractionInfrastructurePolicy["repository"]
  ): Repository {
    const repositories = {
      "local-level": LocalLevelRepository,
      "remote-db": LocalLevelRepository, // TODO: Create RemoteDbRepository
      "browser": BrowserRepository,
    };
    if (!repositories[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return new repositories[type]();
  }
}