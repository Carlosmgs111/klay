import type { TextExtractor } from "../../@core-contracts/services";
import type { Repository } from "../../@core-contracts/repositories";
import type { TextExtractionInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class TextExtractionInfrastructureResolver {
  static async resolve(policy: TextExtractionInfrastructurePolicy): Promise<{
    extractor: TextExtractor;
    repository: Repository;
  }> {
    return {
      extractor: await TextExtractionInfrastructureResolver.resolveExtractor(policy.extractor),
      repository: await TextExtractionInfrastructureResolver.resolveRepository(policy.repository),
    };
  }

  private static async resolveExtractor(
    type: TextExtractionInfrastructurePolicy["extractor"]
  ): Promise<TextExtractor> {
    switch (type) {
      case "pdf": {
        const { PDFTextExtractor } = await import("../extraction/PDFTextExtractor");
        return new PDFTextExtractor();
      }
      case "docx": {
        // TODO: Create DocxTextExtractor
        const { PDFTextExtractor } = await import("../extraction/PDFTextExtractor");
        return new PDFTextExtractor();
      }
      case "txt": {
        // TODO: Create TxtTextExtractor
        const { PDFTextExtractor } = await import("../extraction/PDFTextExtractor");
        return new PDFTextExtractor();
      }
      default:
        throw new Error(`Unsupported extractor: ${type}`);
    }
  }

  private static async resolveRepository(
    type: TextExtractionInfrastructurePolicy["repository"]
  ): Promise<Repository> {
    switch (type) {
      case "local-level": {
        const { LocalLevelRepository } = await import("../repository/LocalLevelRepository");
        return new LocalLevelRepository();
      }
      case "remote-db": {
        // TODO: Create RemoteDbRepository
        const { LocalLevelRepository } = await import("../repository/LocalLevelRepository");
        return new LocalLevelRepository();
      }
      case "browser": {
        const { BrowserRepository } = await import("../repository/BrowserRepository");
        return new BrowserRepository();
      }
      default:
        throw new Error(`Unsupported repository: ${type}`);
    }
  }
}