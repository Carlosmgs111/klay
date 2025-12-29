import type { File } from "./entities";

export interface Repository {
  saveFile(file: File): Promise<void>;
  getFileById(id: string): Promise<File | undefined>;
  getFiles(): Promise<File[]>;
  deleteFile(id: string): Promise<boolean>;
}
