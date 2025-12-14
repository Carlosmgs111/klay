export interface FileDTO {
    id: string;
    name: string;
    type: string;
    size: number;
    lastModified: number;
}

export interface FileUploadDTO {
    id: string;
    name: string;
    buffer: Buffer;
    type: string;
    size: number;
    lastModified: number;
}
    