import type { IRepository } from "../domain/repository";
import type { IStorage } from "../domain/storage";

type File = {
    id: string;
    name: string;
    path: string;
}

export interface IFileManagerUseCases {
    storage: IStorage;
    repository: IRepository;
    getFiles(): Promise<File[]>;
    uploadFile(file: Buffer, fileName: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}