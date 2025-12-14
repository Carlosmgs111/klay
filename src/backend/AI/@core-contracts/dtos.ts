export interface AICompletionDTO {
    systemPrompt: string;
    userPrompt: string;
}

export interface ChunkOptions {
    chunkSize: number;
    chunkOverlap: number;
}