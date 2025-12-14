import type { Storage } from "../@core-contracts/storage";
import type { Repository } from "../@core-contracts/repository";

export class FileManageUseCases {
  storage: Storage;
  repository: Repository;
  constructor(storage: Storage, repository: Repository) {
    this.storage = storage;
    this.repository = repository;
  }

  getFileById = async (id: string) => {
    const file = await this.repository.getFileById(id);
    const fileBuffer = await this.getFileBuffer(id);
    if (!file) {
      throw new Error("File not found");
    }
    return { file, fileBuffer };
  };

  getFiles = async () => {
    const files = await this.repository.getFiles();
    return files;
  };

  uploadFile = async (file: any) => {
    const fileUrl = await this.storage.uploadFile(file.buffer, file.name);
    if (!fileUrl) {
      throw new Error("File not uploaded");
    }
    const fileEntity = {
      id: file.id,
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
