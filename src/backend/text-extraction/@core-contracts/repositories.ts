import type { Text } from "./entities";

export interface Repository {
  saveTextById(index: string, text: Text): Promise<void>;
  getTextById(index: string): Promise<Text>;
  getAllTexts(): Promise<Text[]>;
  getAllIndexes(): Promise<string[]>;
  deleteTextById(index: string): Promise<void>;
  purge(): Promise<void>;
}
