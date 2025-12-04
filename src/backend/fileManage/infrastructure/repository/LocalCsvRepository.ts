import type { IRepository } from "../../@core-contracts/domain/repository";
import fs from "fs";

type File = {
  id: string;
  name: string;
  path: string;
};

export class LocalCsvRepository implements IRepository {
  constructor() {
    if (!fs.existsSync("./database/")) {
      fs.mkdirSync("./database/");
    }
  }
  saveFile = async (file: File) => {
    const { size } = fs.statSync("./database/files.csv");
    console.log({ size });
    fs.appendFileSync(
      "./database/files.csv",
      (!size ? "" : "\n") + file.id + "," + file.name + "," + file.path
    );
  };
  getPathById = async (id: string): Promise<string | undefined> => {
    const files = await this.getFiles();
    return files.find((file) => file.id === id)?.path;
  };
  getFiles = async () => {
    return new Promise<File[]>((resolve, reject) => {
      fs.readFile("./database/files.csv", "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if(!data) resolve([])
        resolve(
          data.split("\n").map((file: string) => {
            const [id, name, path] = file.split(",");
            return { id, name, path };
          })
        );
      });
    });
  };
  deleteFile = async (id: string) => {
    const files = await this.getFiles();
    if (!id) {
      return Promise.reject(false);
    }
    const newFiles = files.filter((file) => file.id !== id);
    console.log({ newFiles });
    const fileToWrite = newFiles
      .map((file, index) => (!index ? "" : "\n") + file.id + "," + file.name + "," + file.path)
      .join("");
    return new Promise<boolean>((resolve, reject) => {
      fs.writeFile("./database/files.csv", fileToWrite, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(true);
      });
    });
  };
}
