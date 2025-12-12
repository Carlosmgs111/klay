import type { FileManageUseCases } from "../../fileManage/application/UseCases";
import type { TextExtractor } from "../@core-contracts/services";
import type { Repository } from "../@core-contracts/repository";
import type { FileUploadDTO } from "../../fileManage/@core-contracts/dtos";

export class MindmapUseCases {
  private fileManagerUseCases: FileManageUseCases;
  private textExtractor: TextExtractor;
  private repository: Repository;
  constructor(
    fileManagerUseCases: FileManageUseCases,
    textExtractor: TextExtractor,
    repository: Repository
  ) {
    this.fileManagerUseCases = fileManagerUseCases;
    this.textExtractor = textExtractor;
    this.repository = repository;
  }
  uploadFileAndGenerateMindmap = async (fileParams: FileUploadDTO) => {
    const { buffer } = fileParams;
    this.fileManagerUseCases.uploadFile(fileParams);
    const text = await this.textExtractor.extractTextFromPDF(buffer);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.repository.saveTextById(fileParams.id, text.text);
    return text;
  };
  selectFileAndGenerateMindmap = async (fileId: string) => {
    const text = await this.extractText(fileId);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.repository.saveTextById(fileId, text.text);
    return text;
  };
  removeMindmap = async (id: string) => {
    await this.repository.deleteTextById(id);
    // await this.fileManagerUseCases.deleteFile(id);
    return true;
  };
  generateNewMindmapFromStoredFile = async (fileId: string) => {
    const text = await this.extractText(fileId);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.repository.saveTextById(fileId, text.text);
    return text;
  };
  extractText = async (fileId: string) => {
    const fileBuffer = await this.fileManagerUseCases.getFileBuffer(fileId);
    const text = await this.textExtractor.extractTextFromPDF(fileBuffer);
    return text;
  };
  getText = async (fileId: string) => {
    const text = await this.repository.getTextById(fileId);
    return text;
  };
  getAllTexts = async () => {
    const texts = await this.repository.getAllTexts();
    return texts;
  };
  getAllIndexes = async () => {
    const indexes = await this.repository.getAllIndexes();
    return indexes;
  };
}
