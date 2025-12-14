import type { AIUsesCases } from "../../AI/application/AIUsesCases";
import type { Repository } from "../@core-contracts/repository";
import type { TextExtractor } from "../@core-contracts/services";

export class MindmapServices {
  constructor(
    private textRepository: Repository,
    private textExtractor: TextExtractor,
    private aiUsesCases: AIUsesCases
  ) {}
  generateNewMindmapFromStoredFile = async (fileId: string) => {};

  generateNewMindmapFromUploadedFile = async (
    { name, id }: any,
    { buffer, id: fileId }: any
  ) => {
    const text = await this.textExtractor.extractTextFromPDF(buffer);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.textRepository.saveTextById(fileId, text.text);
    return text;
  };
}
