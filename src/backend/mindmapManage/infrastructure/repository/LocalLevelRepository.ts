import type { IRepository } from "../../@core-contracts/repository";
import { getDB } from "../../../shared/repositories";
import { Level } from "level";


export class LocalLevelRepository implements IRepository {
  private db: Level;
  constructor() {
    console.log("LocalLevelRepository constructor");
    this.db = getDB();
  }
  saveText = async (index: string, text: string) => {
    try {
      await this.db.put(index, JSON.stringify({ content: text }));
      console.log("Text saved successfully!");
    } catch (error) {
      console.log({ error });
    }
  };


  getText = async (index: string) => {
    try {
      const text = await this.db.get(index);
      return JSON.parse(text);
    } catch (error) {
      console.log({ error });
      return null;
    }
  };
}
