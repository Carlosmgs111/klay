import type { Text } from "./entities";

export interface Repository {
  saveTextById(collectionId: string, index: string, text: Text): Promise<void>;
  getTextById(collectionId: string, index: string): Promise<Text>;
  getAllTexts(collectionId: string): Promise<Text[]>;
  getAllIndexes(collectionId: string): Promise<string[]>;
  deleteTextById(collectionId: string, index: string): Promise<void>;
  clearCollection(collectionId: string): Promise<void>;
  purge(): Promise<void>;
}
