import type { TextExtractedDTO } from "./TextExtractedDTO";

export class TextExtractor {
  extractTextFromPDF(source: Buffer): Promise<TextExtractedDTO | null> {
    throw new Error("Method not implemented.");
  }
}
