import type { Text } from "./Text";

export interface TextRepository {
  saveText(text: Text): Promise<void>;
  getTextById(id: string): Promise<Text>;
  getAllTexts(): Promise<Text[]>;
  deleteTextById(id: string): Promise<void>;
  purge(): Promise<void>;
}
