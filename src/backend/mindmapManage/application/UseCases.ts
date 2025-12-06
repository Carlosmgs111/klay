import type { IFileManagerUseCases } from "../../fileManage/@core-contracts/application/useCases";
import type { IMindmapUseCases } from "../@core-contracts/application/useCases";
import type { TextExtractor } from "../@core-contracts/domain/services";
import type { IRepository } from "../@core-contracts/domain/repository";
import type { fileUploadParams } from "../../fileManage/@core-contracts/application/useCases";

export class MindmapUseCases {
  private fileManagerUseCases: IFileManagerUseCases;
  private textExtractor: TextExtractor;
  private repository: IRepository;
  constructor(
    fileManagerUseCases: IFileManagerUseCases,
    textExtractor: TextExtractor,
    repository: IRepository
  ) {
    this.fileManagerUseCases = fileManagerUseCases;
    this.textExtractor = textExtractor;
    this.repository = repository;
  }
  uploadFileAndGenerateMindmap = async (fileParams: fileUploadParams) => {
    const { buffer } = fileParams;
    this.fileManagerUseCases.uploadFile(fileParams);
    const text = await this.textExtractor.extractTextFromPDF(buffer);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.repository.saveText(fileParams.id, text.text);
    return text;
  };
  generateNewMindmapFromStoredFile = async (fileId: string) => {
    const text = await this.extractText(fileId);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.repository.saveText(fileId, text.text);
    return text;
  };
  extractText = async (fileId: string) => {
    const fileBuffer = await this.fileManagerUseCases.getFileBuffer(fileId);
    const text = await this.textExtractor.extractTextFromPDF(fileBuffer);
    return text;
  };
  getText = async (fileId: string) => {
    const text = await this.repository.getText(fileId);
    return text;
  };
}
