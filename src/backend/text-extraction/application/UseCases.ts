import type { TextExtractor } from "../@core-contracts/services";
import type { Repository } from "../@core-contracts/repositories";
import type {
  TextExtractParams,
  TextExtractionResultDTO,
} from "../@core-contracts/dtos";
import { Text } from "../domain/Text";
import { TextCleanerService } from "./TextCleanerService";

export class UseCases {
  private textExtractor: TextExtractor;
  private textRepository: Repository;
  constructor(textExtractor: TextExtractor, textRepository: Repository) {
    this.textExtractor = textExtractor;
    this.textRepository = textRepository;
  }
  extractTextFromPDF = async ({
    source,
    id,
  }: TextExtractParams): Promise<TextExtractionResultDTO> => {
    if (!source.buffer) {
      throw new Error("File not found");
    }
    const extractedText = await this.textExtractor.extractTextFromPDF(
      source.buffer
    );
    if (!extractedText) {
      throw new Error("Text not extracted");
    }
    const cleanedText = TextCleanerService.cleanAll(extractedText.text);
    const text = new Text(id, source.id, cleanedText, extractedText.metadata);
    await this.textRepository.saveTextById(id, text.toDTO());
    return {
      status: "success",
      message: "Text extracted successfully",
      ...text.toDTO(),
    };
  };
  removeText = async (id: string) => {
    await this.textRepository.deleteTextById(id);
    return true;
  };
  getOneText = async (id: string) => {
    const text = await this.textRepository.getTextById(id);
    return text;
  };
  getAllTexts = async () => {
    const texts = await this.textRepository.getAllTexts();
    return texts;
  };
  getAllIndexes = async () => {
    const indexes = await this.textRepository.getAllIndexes();
    return indexes;
  };
}
