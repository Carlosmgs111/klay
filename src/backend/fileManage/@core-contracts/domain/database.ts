type File = {
    id: string;
    name: string;
    path: string;
}
export interface IDatabase {
    
    saveFile(file: File): Promise<void>;
    getPathById(id: string): Promise<string | undefined>;
    getFiles(): Promise<File[]>;
    deleteFile(id: string): Promise<boolean>;
}