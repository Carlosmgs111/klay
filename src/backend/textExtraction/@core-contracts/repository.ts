import type { TextDTO } from "./dtos";

export interface Repository {
  saveTextById(index: string, text: TextDTO): Promise<void>;
  getTextById(index: string): Promise<TextDTO>;
  getAllTexts(): Promise<TextDTO[]>;
  getAllIndexes(): Promise<string[]>;
  deleteTextById(index: string): Promise<void>;
  purge(): Promise<void>;
}
