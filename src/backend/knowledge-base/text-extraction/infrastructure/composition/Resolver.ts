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
    const resolverTypes = {
      pdf: async () => {
        const { PDFTextExtractor } = await import("../extraction/PDFTextExtractor");
        return new PDFTextExtractor();
      },
      "browser-pdf": async () => {
        const { BrowserPDFTextExtractor } = await import("../extraction/BrowserPDFTextExtractor");
        return new BrowserPDFTextExtractor();
      },
      docx: async () => {
        // TODO: Create DocxTextExtractor
        const { PDFTextExtractor } = await import("../extraction/PDFTextExtractor");
        return new PDFTextExtractor();
      },
      txt: async () => {
        // TODO: Create TxtTextExtractor
        const { PDFTextExtractor } = await import("../extraction/PDFTextExtractor");
        return new PDFTextExtractor();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported extractor: ${type}`);
    }
    return resolverTypes[type]();
  }

  private static async resolveRepository(
    type: TextExtractionInfrastructurePolicy["repository"] 
  ): Promise<Repository> {
    const resolverTypes = {
      leveldb: async () => {
        const { LevelDBRepository } = await import("../repository/LevelDBRepository");
        return new LevelDBRepository();
      },
      idb: async () => {
        const { IDBRepository } = await import("../repository/IDBRepository");
        return new IDBRepository();
      },
      nedb: async () => {
        const { NeDBRepository } = await import("../repository/NeDBRepository");
        return new NeDBRepository();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
 
}