import type { FileDTO, FileUploadDTO } from "./dtos";

export interface FilesApi {
  uploadFile(file: FileUploadDTO): Promise<FileDTO >;
  getFileById(id: string): Promise<FileDTO & { buffer: Buffer }>;
  getFiles(): Promise<FileDTO[]>;
  deleteFile(id: string): Promise<void>;
}
