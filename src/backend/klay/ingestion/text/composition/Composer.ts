import { TextExtractor } from "../application/TextExtractor";
import type { TextRepository } from "../domain/TextRepository";
import type { TextExtractionInfrastructurePolicy } from "./infra-policies";

export class TextInfrastructureComposer {
  static async resolve(policy: TextExtractionInfrastructurePolicy): Promise<{
    extractor: TextExtractor;
    repository: TextRepository;
  }> {
    return {
      extractor: await TextInfrastructureComposer.resolveExtractor(
        policy.extractor
      ),
      repository: await TextInfrastructureComposer.resolveRepository(
        policy.repository
      ),
    };
  }

  private static async resolveExtractor(
    type: TextExtractionInfrastructurePolicy["extractor"]
  ): Promise<TextExtractor> {
    const resolverTypes = {
      pdf: async () => {
        const { PDFTextExtractor } = await import(
          "../infraestructure/extractors/PDFTextExtractor"
        );
        return new PDFTextExtractor();
      },
      "browser-pdf": async () => {
        const { BrowserPDFTextExtractor } = await import(
          "../infraestructure/extractors/BrowserPDFTextExtractor"
        );
        return new BrowserPDFTextExtractor();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported extractor: ${type}`);
    }
    return resolverTypes[type]();
  }

  private static async resolveRepository(
    type: TextExtractionInfrastructurePolicy["repository"]
  ): Promise<TextRepository> {
    const resolverTypes = {
      idb: async () => {
        const { IDBRepository } = await import(
          "../infraestructure/repositories/IDBRepository"
        );
        return new IDBRepository();
      },
      nedb: async () => {
        const { NeDBRepository } = await import(
          "../infraestructure/repositories/NeDBRepository"
        );
        return new NeDBRepository();
      },
    };
    if (!resolverTypes[type]) {
      throw new Error(`Unsupported repository: ${type}`);
    }
    return resolverTypes[type]();
  }
}
