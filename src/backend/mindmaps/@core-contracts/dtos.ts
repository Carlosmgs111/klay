import type { FileUploadDTO } from "../../files/@core-contracts/dtos";

export interface GenerateMindmapParams {
  id: string;
  file: FileUploadDTO;
}
