import type { Repository } from "../../@core-contracts/repositories";
import type { File } from "../../@core-contracts/entities";
import { getDB } from "@/modules/shared/config/repositories";

export class LevelDBRepository implements Repository {
  private db: any;
  private dbInitialized: boolean = false;

  constructor() {
    console.log("LevelDBRepository constructor (files module)");
  }

  private async ensureDB() {
    if (!this.dbInitialized) {
      this.db = await getDB("files");
      this.dbInitialized = true;
    }
  }

  async saveFile(collectionId: string, file: File): Promise<void> {
    try {
      await this.ensureDB();
      const key = `${collectionId}:${file.id}`;
      await this.db.put(key, JSON.stringify(file));
      console.log(`File ${file.id} saved successfully in collection ${collectionId}`);
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  }

  async getFileById(collectionId: string, id: string): Promise<File | undefined> {
    try {
      await this.ensureDB();
      const key = `${collectionId}:${id}`;
      const fileData = await this.db.get(key);

      // Check if data is valid before parsing
      if (fileData === undefined || fileData === null || fileData === "undefined") {
        return undefined;
      }

      return JSON.parse(fileData);
    } catch (error: any) {
      // Level throws an error when key is not found
      if (error?.notFound || error?.code === 'LEVEL_NOT_FOUND') {
        return undefined;
      }
      console.error("Error getting file by id:", error);
      throw error;
    }
  }

  async getFiles(collectionId: string): Promise<File[]> {
    console.log(`Getting files from collection ${collectionId}`);
    try {
      await this.ensureDB();
      const files: File[] = [];
      const prefix = `${collectionId}:`;

      for await (const [key, value] of this.db.iterator()) {
        console.log({ key, value });
        if (key.startsWith(prefix)) {
          files.push(JSON.parse(value));
        }
      }

      return files;
    } catch (error) {
      console.error("Error getting files:", error);
      return [];
    }
  }

  async deleteFile(collectionId: string, id: string): Promise<boolean> {
    try {
      await this.ensureDB();
      const key = `${collectionId}:${id}`;

      // Check if file exists before deleting
      try {
        await this.db.get(key);
      } catch (error: any) {
        if (error?.notFound || error?.code === 'LEVEL_NOT_FOUND') {
          // File doesn't exist, consider it already deleted
          console.log(`File ${id} deleted successfully from collection ${collectionId}`);
          return true;
        }
        throw error;
      }

      await this.db.del(key);
      console.log(`File ${id} deleted successfully from collection ${collectionId}`);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  async clearCollection(collectionId: string): Promise<void> {
    try {
      await this.ensureDB();
      const prefix = `${collectionId}:`;
      const keysToDelete: string[] = [];

      // Collect all keys for this collection
      for await (const key of this.db.keys()) {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }

      // Delete all collected keys
      for (const key of keysToDelete) {
        await this.db.del(key);
      }

      console.log(`Collection ${collectionId} cleared successfully! (${keysToDelete.length} files removed)`);
    } catch (error) {
      console.error("Error clearing collection:", error);
      throw error;
    }
  }

  async purge(): Promise<void> {
    try {
      await this.ensureDB();
      await this.db.clear();
      console.log("Files database purged successfully!");
    } catch (error) {
      console.error("Error purging database:", error);
      throw error;
    }
  }
}
