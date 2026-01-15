import type { File } from "./entities";

export interface Repository {
  saveFile(collectionId: string, file: File): Promise<void>;
  getFileById(collectionId: string, id: string): Promise<File | undefined>;
  getFiles(collectionId: string): Promise<File[]>;
  deleteFile(collectionId: string, id: string): Promise<boolean>;
  clearCollection(collectionId: string): Promise<void>;
  purge(): Promise<void>;
}
