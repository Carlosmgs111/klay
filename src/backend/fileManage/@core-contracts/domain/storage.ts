export interface IStorage {
    uploadFile(file: Buffer, fileName: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<boolean>;
}
