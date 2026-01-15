import type { Text } from "./entities";
import type { TextExtractParams, TextExtractionResultDTO, TextIndexDTO } from "./dtos";

export interface FlowState {
    status: "success" | "error";
    message?: string;
}


export interface TextExtractorApi {
    extractTextFromPDF(command: TextExtractParams): Promise<TextExtractionResultDTO>;
    getOneText(collectionId: string, id: string): Promise<Text>;
    getAllTexts(collectionId: string): Promise<Text[]>;
    getAllIndexes(collectionId: string): Promise<TextIndexDTO[]>;
    removeText(collectionId: string, id: string): Promise<boolean>;
}
