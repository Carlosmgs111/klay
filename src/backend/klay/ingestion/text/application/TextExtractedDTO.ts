export interface TextExtractedDTO {
    content: string;
    metadata?: {
        author?: string;
        title?: string;
        numpages?: number;
    };
}