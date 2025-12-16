import type { TextExtractor } from "../../@core-contracts/services";
import type { TextExtractDTO } from "../../@core-contracts/dtos";

import pdfExtraction from "pdf-extraction";

export class PDFTextExtractor implements TextExtractor {
  extractTextFromPDF = async (
    content: Buffer
  ): Promise<TextExtractDTO | null> => {
    try {
      const {
        text,
        info: { Author, Title, numpages },
      } = await pdfExtraction(content);
      return {
        text,
        metadata: { author: Author, title: Title, numpages },
      };
    } catch (error) {
      console.error("Error al extraer el texto del PDF:", error);
      return null;
    }
  };
}
