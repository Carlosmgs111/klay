import type { Storage } from "../../@core-contracts/storage";
import fs from "fs";

export class LocalFsStorage implements Storage {
  private storagePath: string = "./uploads";
  constructor() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath);
    }
  }

  uploadFile = async (file: Buffer, fileName: string): Promise<string> => {
    const filePath = `${this.storagePath}/${fileName}`;
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(filePath);
      });
    });
  };
  loadFileBuffer = async (fileName: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      fs.readFile(this.storagePath + "/" + fileName, (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(data);
      });
    });
  };
  deleteFile = async (fileName: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      fs.unlink(this.storagePath + "/" + fileName, (err) => {
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
  };
}
