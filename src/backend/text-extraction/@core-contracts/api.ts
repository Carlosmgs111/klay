import type { Text } from "./entities";
import type { TextExtractParams } from "./dtos";


export interface TextExtractorApi {
    extractTextFromPDF(command: TextExtractParams): Promise<Text>;
    getOneText(id: string): Promise<Text>;
    getAllTexts(): Promise<Text[]>;
    getAllIndexes(): Promise<string[]>;
    removeText(id: string): Promise<boolean>;
}
