export interface FileManagePort {
    uploadFile(file: any): Promise<string>;
    getFileById(id: string): Promise<any>;
    getFiles(): Promise<any[]>;
    deleteFile(id: string): Promise<void>;
}
