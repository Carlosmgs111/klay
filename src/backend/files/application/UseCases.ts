import type { Storage } from "../@core-contracts/storage";
import type { Repository } from "../@core-contracts/repositories";
import type { FileUploadDTO } from "../@core-contracts/dtos";
import type { File } from "../@core-contracts/entities";
import type { ApplicationResult } from "@/modules/shared/@core-contracts/result";

export class FilesUseCases {
  storage: Storage;
  repository: Repository;
  constructor(storage: Storage, repository: Repository) {
    this.storage = storage;
    this.repository = repository;
  }

  getFileById = async (
    collectionId: string,
    id: string
  ): Promise<File & { buffer: Buffer }> => {
    const file = await this.repository.getFileById(collectionId, id);
    const fileBuffer = await this.getFileBuffer(collectionId, id);
    if (!file) {
      throw new Error("File not found");
    }
    return { ...file, buffer: fileBuffer };
  };

  getFiles = async (collectionId: string): Promise<File[]> => {
    console.log("collectionId", collectionId);
    const files = await this.repository.getFiles(collectionId);
    return files;
  };

  uploadFile = async ({
    file,
    collectionId,
  }: {
    file: FileUploadDTO;
    collectionId: string;
  }): Promise<ApplicationResult<FileUploadDTO & { collectionId: string }>> => {
   try{ console.log("uploading file", file);
    const fileUrl = await this.storage.uploadFile(file.buffer, file.name);
    console.log({ fileUrl });
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
    console.log({ fileEntity });
    await this.repository.saveFile(collectionId, fileEntity);
    return {
      data: {
        ...fileEntity,
        buffer: file.buffer,
        collectionId,
      },
      status: "SUCCESS",
    };}
    catch (error) {
      console.log(error);
      return {
        status: "ERROR",
        error: { code: 500, message: "File not uploaded" },
      };
    }
  };

  deleteFile = async (collectionId: string, fileId: string) => {
    const file = await this.repository.getFileById(collectionId, fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const deleted = await this.storage.deleteFile(file.name);
    if (!deleted) {
      throw new Error("File not deleted");
    }
    const deletedDb = await this.repository.deleteFile(collectionId, fileId);
    if (!deletedDb) {
      throw new Error("File not deleted in database");
    }
  };

  private getFileBuffer = async (
    collectionId: string,
    fileId: string
  ): Promise<Buffer> => {
    const file = await this.repository.getFileById(collectionId, fileId);
    if (!file) {
      throw new Error("File not found");
    }
    const fileBuffer = await this.storage.loadFileBuffer(file.name);
    return fileBuffer;
  };
}
