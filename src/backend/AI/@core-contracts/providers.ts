export interface AIProvider {
    generateCompletion(prompt: string): Promise<string>;
    streamCompletion(prompt: string): AsyncGenerator<string>;
}