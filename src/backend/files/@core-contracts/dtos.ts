import type { File } from "./entities";

export interface FileUploadDTO extends Exclude<File, "url"> {
  buffer: Buffer;
}

export interface FileUploadResultDTO extends Partial<File> {
  status: "SUCCESS" | "ERROR";
  message?: string;
}
