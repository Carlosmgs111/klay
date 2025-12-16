import type { FilesApi } from "../../files/@core-contracts/filesApi";
import type { TextExtractorApi } from "../../textExtraction/@core-contracts/textExtractorApi";
import type { GenerateMindmapParams } from "../@core-contracts/dtos";

export class UseCases {
  constructor(
    private filesApi: FilesApi,
    private textExtractorApi: TextExtractorApi
  ) {}
  uploadFileAndGenerateMindmap = async ({
    id,
    file,
  }: GenerateMindmapParams) => {
    const { buffer } = file;
    this.filesApi.uploadFile(file);
    const text = await this.textExtractorApi.extractTextFromPDF({
      source: { buffer, id },
      id,
    });
    if (!text) {
      throw new Error("Text not extracted");
    }
    return text;
  };
  selectFileAndGenerateMindmap = async (id: string, fileId: string) => {
    const { buffer } = await this.filesApi.getFileById(fileId);
    const text = await this.textExtractorApi.extractTextFromPDF({
      source: { buffer, id: fileId },
      id,
    });
    if (!text) {
      throw new Error("Text not extracted");
    }
    return text.text;
  };
}
