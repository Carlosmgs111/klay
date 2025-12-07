export interface Storage {
    uploadFile(file: Buffer, fileName: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<boolean>;
    loadFileBuffer(fileName: string): Promise<Buffer>;
}
