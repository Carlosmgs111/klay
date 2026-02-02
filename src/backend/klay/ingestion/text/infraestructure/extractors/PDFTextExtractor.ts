import { TextExtractor } from "../../application/TextExtractor";
import type { TextExtractedDTO } from "../../application/TextExtractedDTO";

import pdfExtraction from "pdf-extraction";

export class PDFTextExtractor implements TextExtractor {
  extractTextFromPDF = async (
    source: Buffer
  ): Promise<TextExtractedDTO | null> => {
    try {
      const {
        text,
        info: { Author, Title, numpages },
      } = await pdfExtraction(source);
      return {
        content: text,
        metadata: { author: Author, title: Title, numpages },
      };
    } catch (error) {
      console.error("Error al extraer el texto del PDF:", error);
      return null;
    }
  };
}
