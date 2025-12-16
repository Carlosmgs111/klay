import type { Repository } from "../../@core-contracts/repository";
import type { TextDTO } from "../../@core-contracts/dtos";
import { getDB } from "../../../shared/config/repositories";
import { Level } from "level";

export class LocalLevelRepository implements Repository {
  private db: Level;
  constructor() {
    console.log("LocalLevelRepository constructor");
    this.db = getDB();
  }
  saveTextById = async (index: string, text: TextDTO) => {
    try {
      await this.db.put(index, JSON.stringify(text));
      console.log("Text saved successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
  deleteTextById = async (index: string) => {
    try {
      await this.db.del(index);
      console.log("Text deleted successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
  getAllIndexes = async (): Promise<string[]> => {
    try {
      const indexes = [];
      for await (const key of this.db.keys()) {
        indexes.push(key);
      }
      return indexes;
    } catch (error) {
      console.log({ error });
      return [];
    }
  };
  getAllTexts = async () => {
    try {
      const texts = [];
      for await (const value of this.db.values()) {
        texts.push(JSON.parse(value));
      }
      return texts;
    } catch (error) {
      console.log({ error });
      return [];
    }
  };
  getTextById = async (index: string) => {
    try {
      const text = await this.db.get(index);
      return JSON.parse(text);
    } catch (error) {
      console.log({ error });
      return null;
    }
  };
  purge = async () => {
    try {
      await this.db.clear();
      console.log("Database purged successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
}
