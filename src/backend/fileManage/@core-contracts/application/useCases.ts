import type { IDatabase } from "../domain/database";
import type { IStorage } from "../domain/storage";

type File = {
    id: string;
    name: string;
    path: string;
}

export interface IFileManagerUseCases {
    storage: IStorage;
    database: IDatabase;
    getFiles(): Promise<File[]>;
    uploadFile(file: Buffer, fileName: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
}