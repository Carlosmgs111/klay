import type { IFileManagerUseCases } from "../@core-contracts/application/useCases";
import type { IStorage } from "../@core-contracts/domain/storage";
import type { IRepository } from "../@core-contracts/domain/repository";

export class FileManagerUseCases implements IFileManagerUseCases {
    storage: IStorage;
    repository: IRepository;
    constructor(
        storage: IStorage,
        repository: IRepository
    ) {
        this.storage = storage;
        this.repository = repository;
    }

    getFiles = async() => {
        const files = await this.repository.getFiles();
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
        await this.repository.saveFile(fileEntity);
        return fileUrl;
    }

    deleteFile = async(fileId: string) => {
        const filePath = await this.repository.getPathById(fileId);
        if (!filePath) {
            throw new Error("File not found");
        }
        const deleted = await this.storage.deleteFile(filePath);
        if(!deleted) {
            throw new Error("File not deleted");
        }
        const deletedDb = await this.repository.deleteFile(fileId);
        if(!deletedDb) {
            throw new Error("File not deleted in database");
        }
    }
}
    