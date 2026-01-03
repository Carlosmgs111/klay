import type { Storage } from "../@core-contracts/storage";
import type { Repository } from "../@core-contracts/repositories";
import type { FileUploadDTO } from "../@core-contracts/dtos";
import type { File } from "../@core-contracts/entities";
import type { FileUploadResultDTO } from "../@core-contracts/dtos";
import type { ApplicationResult } from "@/modules/shared/@core-contracts/result";

export class FilesUseCases {
  storage: Storage;
  repository: Repository;
  constructor(storage: Storage, repository: Repository) {
    this.storage = storage;
    this.repository = repository;
  }

  getFileById = async (id: string): Promise<File & { buffer: Buffer }> => {
    const file = await this.repository.getFileById(id);
    const fileBuffer = await this.getFileBuffer(id);
    if (!file) {
      throw new Error("File not found");
    }
    return { ...file, buffer: fileBuffer };
  };

  getFiles = async (): Promise<File[]> => {
    const files = await this.repository.getFiles();
    return files;
  };

  uploadFile = async (
    file: FileUploadDTO
  ): Promise<ApplicationResult<FileUploadDTO>> => {
    const fileUrl = await this.storage.uploadFile(file.buffer, file.name);
    if (!fileUrl) {
      return {
        status: "ERROR",
        error: { code: 500, message: "File not uploaded" },
      };
    }
    const fileEntity: File = {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      url: fileUrl,
    };
    await this.repository.saveFile(fileEntity);
    return { data: { ...fileEntity, buffer: file.buffer }, status: "SUCCESS" };
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

  private getFileBuffer = async (fileId: string): Promise<Buffer> => {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const fileBuffer = await this.storage.loadFileBuffer(file.name);
    return fileBuffer;
  };
}
