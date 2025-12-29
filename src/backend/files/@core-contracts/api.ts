import type { FileUploadDTO } from "./dtos";

export interface FilesApi {
  uploadFile(file: FileUploadDTO): Promise<File >;
  getFileById(id: string): Promise<File & { buffer: Buffer }>;
  getFiles(): Promise<File[]>;
  deleteFile(id: string): Promise<void>;
}
