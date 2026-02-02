import type { TextExtractor } from "../../application/TextExtractor";
import type { TextExtractedDTO } from "../../application/TextExtractedDTO";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker for pdfjs in browser
if (typeof window !== "undefined") {
  // Use the worker from node_modules instead of CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

export class BrowserPDFTextExtractor implements TextExtractor {
  extractTextFromPDF = async (
    content: Uint8Array | ArrayBuffer | any
  ): Promise<TextExtractedDTO | null> => {
    try {
      // Ensure we have Uint8Array (works with Buffer, ArrayBuffer, and Uint8Array)
      let data: Uint8Array;

      if (content instanceof Uint8Array) {
        data = content;
      } else if (content instanceof ArrayBuffer) {
        data = new Uint8Array(content);
      } else if (content?.buffer instanceof ArrayBuffer) {
        // Handle Buffer-like objects in browser (they have a .buffer property)
        data = new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
      } else {
        // Fallback: try to create Uint8Array directly
        data = new Uint8Array(content);
      }

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;

      // Extract metadata
      const metadata: any = await pdf.getMetadata();
      const numPages = pdf.numPages;

      // Extract text from all pages
      let fullText = "";
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine all text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += pageText + "\n\n";
      }

      return {
        content: fullText.trim(),
        metadata: {
          author: metadata.info?.Author || "",
          title: metadata.info?.Title || "",
          numpages: numPages,
        },
      };
    } catch (error) {
      console.error("Error extracting text from PDF in browser:", error);
      return null;
    }
  };
}
