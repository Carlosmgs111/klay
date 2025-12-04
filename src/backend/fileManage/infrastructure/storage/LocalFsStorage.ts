import type { IStorage } from "../../@core-contracts/domain/storage";
import fs from "fs";

export class LocalFsStorage implements IStorage {
  constructor() {
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const filePath = `./uploads/${fileName}`;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(filePath);
      });
    });
  }
  async deleteFile(fileName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.unlink(fileName, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            // El archivo ya no existe → considérelo eliminado
            return resolve(true);
          }
          console.error(err);
          reject(err);
        }
        resolve(true);
      });
    });
  }
}
