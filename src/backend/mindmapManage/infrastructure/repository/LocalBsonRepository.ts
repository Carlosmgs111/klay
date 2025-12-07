import type { IRepository } from "../../@core-contracts/repository";
import fs from "fs";
import { BSON, ObjectId } from "bson";

export class LocalBsonRepository implements IRepository {
  private repositoryPath: string = "./database/";

  constructor() {
    if (!fs.existsSync(this.repositoryPath)) {
      fs.mkdirSync(this.repositoryPath);
    }
  }

  saveText = async (text: string) => {
    const file = this.repositoryPath + "texts.bson";

    // Si no existe, inicialízalo con un documento raíz BSON válido
    if (!fs.existsSync(file)) {
      const bson = BSON.serialize({ texts: [] });
      fs.writeFileSync(file, bson);
    }

    try {
      // Leer el archivo completo como binario
      const buffer = fs.readFileSync(file);

      // Deserializar el documento raíz
      const bson = BSON.deserialize(buffer);

      // Mutar la colección en memoria
      bson.texts.push({
        _id: new ObjectId(),
        content: text,
      });

      // Re-serializar *todo* el documento raíz
      const newBuffer = BSON.serialize(bson);

      // Sobrescribir COMPLETO el archivo (sin texto extra)
      fs.writeFileSync(file, newBuffer);
    } catch (error) {
      console.error(error);
    }
  };
  getText = async () => {
    const file = this.repositoryPath + "texts.bson";
    try {
      const buffer = fs.readFileSync(file);
      const bson = BSON.deserialize(buffer);
      return bson.texts;
    } catch (error) {
      console.error(error);
    }
  };
}
