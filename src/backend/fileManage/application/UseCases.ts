import type { IFileManagerUseCases } from "../@core-contracts/application/useCases";
import type { IStorage } from "../@core-contracts/domain/storage";
import type { IDatabase } from "../@core-contracts/domain/database";

export class FileManagerUseCases implements IFileManagerUseCases {
    storage: IStorage;
    database: IDatabase;
    constructor(
        storage: IStorage,
        database: IDatabase
    ) {
        this.storage = storage;
        this.database = database;
    }

    getFiles = async() => {
        const files = await this.database.getFiles();
        return files;
    }

    uploadFile = async(file: Buffer, fileName: string) => {
        const fileUrl = await this.storage.uploadFile(file, fileName);
        if (!fileUrl) {
            throw new Error("File not uploaded");
        }
        const fileEntity = {
            id: crypto.randomUUID(),
            name: fileName,
            path: fileUrl
        }
        await this.database.saveFile(fileEntity);
        return fileUrl;
    }

    deleteFile = async(fileId: string) => {
        const filePath = await this.database.getPathById(fileId);
        if (!filePath) {
            throw new Error("File not found");
        }
        const deleted = await this.storage.deleteFile(filePath);
        if(!deleted) {
            throw new Error("File not deleted");
        }
        const deletedDb = await this.database.deleteFile(fileId);
        if(!deletedDb) {
            throw new Error("File not deleted in database");
        }
    }
}
    