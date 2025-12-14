import type { FileManagePort } from "../../fileManage/@core-contracts/fileManagePort";
import type { TextExtractor } from "../@core-contracts/services";
import type { Repository } from "../@core-contracts/repository";
import type { FileUploadDTO } from "../../fileManage/@core-contracts/dtos";
import type { MindmapServices } from "./MindmapServices";

export class MindmapUseCases {
  private fileManagerUseCases: FileManagePort;
  private textExtractor: TextExtractor;
  private textRepository: Repository;
  private mindmapServices: MindmapServices;
  constructor(
    fileManagerUseCases: FileManagePort,
    textExtractor: TextExtractor,
    textRepository: Repository,
    mindmapServices: MindmapServices,
  ) {
    this.fileManagerUseCases = fileManagerUseCases;
    this.textExtractor = textExtractor;
    this.textRepository = textRepository;
    this.mindmapServices = mindmapServices;
  }
  uploadFileAndGenerateMindmap = async (fileParams: FileUploadDTO) => {
    const { buffer } = fileParams;
    this.fileManagerUseCases.uploadFile(fileParams);
    const text = await this.mindmapServices.generateNewMindmapFromUploadedFile(
      {},
      { buffer, id: fileParams.id }
    );
    return text;
  };
  selectFileAndGenerateMindmap = async (fileId: string) => {
    const text = await this.extractText(fileId);
    if (!text) {
      throw new Error("Text not extracted");
    }
    await this.textRepository.saveTextById(fileId, text.text);
    return text;
  };
  removeMindmap = async (id: string) => {
    await this.textRepository.deleteTextById(id);
    // await this.fileManagerUseCases.deleteFile(id);
    return true;
  };
  extractText = async (fileId: string) => {
    const fileBuffer = await this.fileManagerUseCases.getFileById(fileId);
    if (!fileBuffer) {
      throw new Error("File not found");
    }
    const text = await this.textExtractor.extractTextFromPDF(fileBuffer);
    return text;
  };
  getText = async (fileId: string) => {
    const text = await this.textRepository.getTextById(fileId);
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
