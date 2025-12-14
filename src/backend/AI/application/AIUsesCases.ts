import type { AIProvider } from "../@core-contracts/providers";
import type { TextChunker } from "../@core-contracts/services";
import type { PromptBuilder } from "../@core-contracts/services";
import type { AICompletionDTO } from "../@core-contracts/dtos";

export class AIUsesCases {
  constructor(
    private aiProvider: AIProvider
  ) // private textChunker: TextChunker,
  // private promptBuilder: PromptBuilder
  {}

  async *streamCompletion(dto: AICompletionDTO) {
    const { systemPrompt, userPrompt } = dto;
    // const chunks = await this.textChunker.chunkText(userPrompt);
    // const prompt = await this.promptBuilder.buildPrompt(chunks);
    for await (const chunk of this.aiProvider.streamCompletion(userPrompt)) {
      yield chunk;
    }
  }
}
