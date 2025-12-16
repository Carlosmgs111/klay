import type { TextExtractDTO } from "./dtos";

export interface TextExtractor {
  extractTextFromPDF(
    fileBuffer: Buffer
  ): Promise<TextExtractDTO | null>;
}
