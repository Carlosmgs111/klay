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

  saveText = async (text: Text): Promise<void> => {
    try {
      await this.ensureDB();
      await this.db.put(text.id, JSON.stringify(text));
      console.log("Text saved successfully!");
    } catch (error) {
      console.log({ error });
      throw error;
    }
  };

  deleteTextById = async (id: string): Promise<void> => {
    try {
      await this.ensureDB();
      await this.db.del(id);
      console.log("Text deleted successfully!");
    } catch (error) {
      console.log({ error });
      throw error;
    }
  };

  getAllTexts = async (): Promise<Text[]> => {
    try {
      await this.ensureDB();
      const texts: Text[] = [];
      for await (const [key, value] of this.db.iterator()) {
        texts.push(JSON.parse(value));
      }
      return texts;
    } catch (error) {
      console.log({ error });
      return [];
    }
  };

  getTextById = async (id: string): Promise<Text> => {
    try {
      await this.ensureDB();
      const text = await this.db.get(id);
      return JSON.parse(text);
    } catch (error: any) {
      if (error?.notFound || error?.code === 'LEVEL_NOT_FOUND') {
        throw new Error(`Text with id ${id} not found`);
      }
      console.log({ error });
      throw error;
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
