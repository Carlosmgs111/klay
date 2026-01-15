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
    collectionId,
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
    console.log({ extractedText });
    const cleanedText = TextCleanerService.cleanAll(extractedText.content);
    const text = new Text(id, source.id, cleanedText, extractedText.metadata);
    await this.textRepository.saveTextById(collectionId, id, text.toDTO());
    return {
      status: "success",
      message: "Text extracted successfully",
      ...text.toDTO(),
    };
  };
  removeText = async (collectionId: string, id: string) => {
    await this.textRepository.deleteTextById(collectionId, id);
    return true;
  };
  getOneText = async (collectionId: string, id: string) => {
    const text = await this.textRepository.getTextById(collectionId, id);
    return text;
  };
  getAllTexts = async (collectionId: string) => {
    const texts = await this.textRepository.getAllTexts(collectionId);
    return texts;
  };
  getAllIndexes = async (collectionId: string) => {
    const texts = await this.textRepository.getAllTexts(collectionId);
    console.log(texts);
    return texts.map(({ content, ...rest }) => rest);
  };
}
