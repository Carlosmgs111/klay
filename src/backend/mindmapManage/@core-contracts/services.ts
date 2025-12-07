export interface TextExtractor {
  extractTextFromPDF(
    fileBuffer: Buffer
  ): Promise<{
    text: string;
    metadata: { author: string; title: string };
  } | null>;
}
