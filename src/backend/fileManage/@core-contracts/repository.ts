import type { FileDTO } from "./dtos";

export interface Repository {
  saveFile(file: FileDTO): Promise<void>;
  getFileById(id: string): Promise<FileDTO | undefined>;
  getFiles(): Promise<FileDTO[]>;
  deleteFile(id: string): Promise<boolean>;
}
