import type { File } from "./entities";

export interface FileUploadDTO extends File {
    buffer: Buffer;
}
    