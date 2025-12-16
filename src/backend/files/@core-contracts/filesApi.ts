import type { FileDTO } from "./dtos";

export interface FilesApi {
  uploadFile(file: any): Promise<string>;
  getFileById(id: string): Promise<{ file: FileDTO; buffer: Buffer }>;
  getFiles(): Promise<FileDTO[]>;
  deleteFile(id: string): Promise<void>;
}
