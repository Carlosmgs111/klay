import type { Repository } from "../../@core-contracts/repositories";
import type { Text } from "../../@core-contracts/entities";
import { getDB } from "@/modules/shared/config/repositories";
// import { Level } from "level";

export class LevelDBRepository implements Repository {
  private db: any;
  private dbInitialized: boolean = false;

  constructor() {
    console.log("LevelDBRepository constructor");
  }

  private async ensureDB() {
    if (!this.dbInitialized) {
      this.db = await getDB("texts");
      this.dbInitialized = true;
    }
  }

  saveTextById = async (collectionId: string, index: string, text: Text) => {
    try {
      await this.ensureDB();
      const key = `${collectionId}:${index}`;
      await this.db.put(key, JSON.stringify(text));
      console.log("Text saved successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
  deleteTextById = async (collectionId: string, index: string) => {
    try {
      await this.ensureDB();
      const key = `${collectionId}:${index}`;
      await this.db.del(key);
      console.log("Text deleted successfully!");
    } catch (error) {
      console.log({ error });
    }
  };
  getAllIndexes = async (collectionId: string): Promise<string[]> => {
    try {
      await this.ensureDB();
      const indexes = [];
      const prefix = `${collectionId}:`;
      for await (const key of this.db.keys()) {
        if (key.startsWith(prefix)) {
          indexes.push(key.substring(prefix.length));
        }
      }
      return indexes;
    } catch (error) {
      console.log({ error });
      return [];
    }
  };
  getAllTexts = async (collectionId: string) => {
    try {
      await this.ensureDB();
      const texts = [];
      const prefix = `${collectionId}:`;
      for await (const [key, value] of this.db.iterator()) {
        if (key.startsWith(prefix)) {
          texts.push(JSON.parse(value));
        }
      }
      return texts;
    } catch (error) {
      console.log({ error });
      return [];
    }
  };
  getTextById = async (collectionId: string, index: string) => {
    try {
      await this.ensureDB();
      const key = `${collectionId}:${index}`;
      const text = await this.db.get(key);
      return JSON.parse(text);
    } catch (error) {
      console.log({ error });
      return null;
    }
  };
  clearCollection = async (collectionId: string) => {
    try {
      await this.ensureDB();
      const prefix = `${collectionId}:`;
      const keysToDelete = [];
      for await (const key of this.db.keys()) {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        await this.db.del(key);
      }
      console.log(`Collection ${collectionId} cleared successfully!`);
    } catch (error) {
      console.log({ error });
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
