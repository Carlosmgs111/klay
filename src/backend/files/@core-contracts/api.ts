import type { FileUploadDTO } from "./dtos";
import type { File } from "./entities";
import type { FileUploadResultDTO } from "./dtos";

export interface FilesApi {
  uploadFile({file, collectionId}: {file: FileUploadDTO, collectionId: string}): Promise<FileUploadResultDTO>;
  getFileById(collectionId: string, id: string): Promise<File & { buffer: Buffer }>;
  getFiles(collectionId: string): Promise<File[]>;
  deleteFile(collectionId: string, id: string): Promise<void>;
}
