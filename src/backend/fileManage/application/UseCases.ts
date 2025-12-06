import type {
  IFileManagerUseCases,
  fileUploadParams,
} from "../@core-contracts/application/useCases";
import type { IStorage } from "../@core-contracts/domain/storage";
import type { IRepository } from "../@core-contracts/domain/repository";

export class FileManagerUseCases implements IFileManagerUseCases {
  storage: IStorage;
  repository: IRepository;
  constructor(storage: IStorage, repository: IRepository) {
    this.storage = storage;
    this.repository = repository;
  }

  getFiles = async () => {
    const files = await this.repository.getFiles();
    return files;
  };

  uploadFile = async (file: fileUploadParams) => {
    const fileUrl = await this.storage.uploadFile(file.buffer, file.name);
    if (!fileUrl) {
      throw new Error("File not uploaded");
    }
    const fileEntity = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    };
    await this.repository.saveFile(fileEntity);
    return fileUrl;
  };

  getFileBuffer = async (fileId: string) => {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const fileBuffer = await this.storage.loadFileBuffer(file.name);
    return fileBuffer;
  };

  deleteFile = async (fileId: string) => {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const deleted = await this.storage.deleteFile(file.name);
    if (!deleted) {
      throw new Error("File not deleted");
    }
    const deletedDb = await this.repository.deleteFile(fileId);
    if (!deletedDb) {
      throw new Error("File not deleted in database");
    }
  };
}
