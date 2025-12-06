import type { IRepository } from "../domain/repository";
import type { IStorage } from "../domain/storage";

type File = {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

export type fileUploadParams = {
  id: string;
  name: string;
  buffer: Buffer;
  type: string;
  size: number;
  lastModified: number;
};

export interface IFileManagerUseCases {
  storage: IStorage;
  repository: IRepository;
  getFiles(): Promise<File[]>;
  getFileById(id: string): Promise<File>;
  getFileBuffer(fileId: string): Promise<Buffer>;
  uploadFile(file: fileUploadParams): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
