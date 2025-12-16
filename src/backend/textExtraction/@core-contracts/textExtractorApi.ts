import type { TextDTO, TextExtractParams } from "./dtos";

export interface TextExtractorApi {
    extractTextFromPDF(command: TextExtractParams): Promise<TextDTO>;
    getOneText(id: string): Promise<TextDTO>;
    getAllTexts(): Promise<TextDTO[]>;
    getAllIndexes(): Promise<string[]>;
    removeText(id: string): Promise<boolean>;
}
