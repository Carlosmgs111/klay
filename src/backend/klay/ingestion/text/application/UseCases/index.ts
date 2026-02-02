import { ExtractTextFromPDFUseCase } from "./ExtractTextUseCase";
import { GetOneTextUseCase } from "./GetOneTextUseCase";
import { TextExtractor } from "../TextExtractor";
import type { TextRepository } from "../../domain/TextRepository";

export class UseCases {
  extractTextFromPDF: ExtractTextFromPDFUseCase;
  getOneText: GetOneTextUseCase;
  constructor(textExtractor: TextExtractor, textRepository: TextRepository) {
    this.extractTextFromPDF = new ExtractTextFromPDFUseCase(
      textExtractor,
      textRepository
    );
    this.getOneText = new GetOneTextUseCase();
  }
}
