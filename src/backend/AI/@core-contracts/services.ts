export interface TextChunker {
  chunkText(text: string): Promise<string[]>;
}

export interface PromptBuilder {
  buildPrompt(chunks: string[]): Promise<string>;
}
