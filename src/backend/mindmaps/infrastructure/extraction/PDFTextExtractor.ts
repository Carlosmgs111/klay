import type { TextExtractor } from "../../@core-contracts/services";

import pdfExtraction from "pdf-extraction";

export class PDFTextExtractor implements TextExtractor {
  extractTextFromPDF = async (
    content: Buffer
  ): Promise<{
    text: string;
    metadata: { author: string; title: string };
  } | null> => {
    try {
      const {
        text,
        numpages,
        info: { Author, Title },
        ...rest
      } = await pdfExtraction(content);
      return { text, metadata: { author: Author, title: Title } };
    } catch (error) {
      console.error("Error al extraer el texto del PDF:", error);
      return null;
    }
  };
}
