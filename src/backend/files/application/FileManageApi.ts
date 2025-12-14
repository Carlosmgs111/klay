import type { FileManagePort } from "../@core-contracts/fileManagePort";
import type { FileManageUseCases } from "../application/UseCases";

export class FileManageApi implements FileManagePort {
  constructor(private fileManageUseCases: FileManageUseCases) {}
  uploadFile = async (file: any) => {
    return await this.fileManageUseCases.uploadFile(file);
  };
  getFileById = async (id: string) => {
    return await this.fileManageUseCases.getFileById(id);
  };
  getFiles = async () => {
    return await this.fileManageUseCases.getFiles();
  };
  deleteFile = async (id: string) => {
    return await this.fileManageUseCases.deleteFile(id);
  };
}
