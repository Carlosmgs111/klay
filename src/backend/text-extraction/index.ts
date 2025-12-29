/*
 * This is module will process the documents and extract the text from them
 * - Extract text from buffer
 * - Clean extracted text
 * - Manage cleaned text in database
 */
import type { TextExtractorApi } from "./@core-contracts/api";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { PDFTextExtractor } from "./infrastructure/extraction/PDFTextExtractor";
import { UseCases } from "./application/UseCases";
import { LocalLevelRepository } from "./infrastructure/repository/LocalLevelRepository";

const pdfTextExtractor = new PDFTextExtractor();
const textRepository = new LocalLevelRepository();
export const textExtractorApi: TextExtractorApi = new UseCases(
  pdfTextExtractor,
  textRepository
);
export const textsRouter = new AstroRouter(textExtractorApi);
