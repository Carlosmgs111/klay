import type { File } from "./entities";

export interface FileUploadDTO
  extends Pick<File, "name" | "type" | "size" | "lastModified" | "id"> {
  buffer: Buffer;
}

export interface FileUploadResultDTO extends Partial<File> {
  status: "success" | "error";
  message?: string;
}
