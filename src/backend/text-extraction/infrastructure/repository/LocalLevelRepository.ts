import type { Repository } from "../../@core-contracts/repositories";
import type { Text } from "../../@core-contracts/entities";
import { getTextsDB } from "../../../shared/config/repositories";
// import { Level } from "level";

export class LocalLevelRepository implements Repository {
  private db: any;
  private dbInitialized: boolean = false;

  constructor() {
    console.log("LocalLevelRepository constructor");
  }

  private async ensureDB() {
    if (!this.dbInitialized) {
      this.db = await getTextsDB();
      this.dbInitialized = true;
    }
  }

  saveTextById = async (index: string, text: Text) => {
    try {
      await this.ensureDB();
      await this.db.put(index, JSON.stringify(text));
      console.log("Text saved successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
  deleteTextById = async (index: string) => {
    try {
      await this.ensureDB();
      await this.db.del(index);
      console.log("Text deleted successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
  getAllIndexes = async (): Promise<string[]> => {
    try {
      await this.ensureDB();
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
      await this.ensureDB();
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
      await this.ensureDB();
      const text = await this.db.get(index);
      return JSON.parse(text);
    } catch (error) {
      console.log({ error });
      return null;
    }
  };
  purge = async () => {
    try {
      await this.ensureDB();
      await this.db.clear();
      console.log("Database purged successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
}
