import type { Repository } from "../../@core-contracts/repositories";
import type { FileDTO } from "../../@core-contracts/dtos";
import fs from "fs";

export class LocalCsvRepository implements Repository {
  private repositoryPath: string = "./database/";
  constructor() {
    if (!fs.existsSync(this.repositoryPath)) {
      fs.mkdirSync(this.repositoryPath);
    }
  }
  saveFile = async (file: FileDTO) => {
    const { size } = fs.statSync(this.repositoryPath + "files.csv");
    fs.appendFileSync(
      this.repositoryPath + "files.csv",
      (!size ? "" : "\n") +
        file.id +
        "," +
        file.name +
        "," +
        file.type +
        "," +
        file.size +
        "," +
        file.lastModified
    );
  };
  getFileById = async (id: string): Promise<FileDTO | undefined> => {
    const files = await this.getFiles();
    return files.find((file) => file.id === id);
  };
  getFiles = async () => {
    return new Promise<FileDTO[]>((resolve, reject) => {
      fs.readFile(this.repositoryPath + "files.csv", "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if (!data) resolve([]);
        resolve(
          data.split("\n").map((file: string) => {
            const [id, name, type, size, lastModified] = file.split(",");
            return {
              id,
              name,
              type,
              size: Number(size),
              lastModified: Number(lastModified),
            };
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
      .map(
        (file, index) =>
          (!index ? "" : "\n") +
          file.id +
          "," +
          file.name +
          "," +
          file.type +
          "," +
          file.size +
          "," +
          file.lastModified
      )
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
