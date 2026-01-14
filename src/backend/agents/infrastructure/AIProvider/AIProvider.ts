import type { AIProvider } from "../../@core-contracts/providers";
import type { AgentDTO, AICompletionDTO } from "../../@core-contracts/dtos";
import { Experimental_Agent as Agent } from "ai";
import { createHuggingFace } from "@ai-sdk/huggingface";

export class AISDKProvider implements AIProvider {
  private model: any;
  private agent: any;
  constructor({ model }: { model: string }) {
    this.model = createHuggingFace({
      apiKey: import.meta.env.HF_API_KEY,
    }).languageModel(model);
    this.agent = new Agent({
      model: this.model,
    });
  }

  generateCompletion = async (command: AICompletionDTO) => {
    return command.userPrompt;
  };
  async *streamCompletion(command: AICompletionDTO) {
    try {
      const { textStream } = this.agent.stream({ prompt: command.userPrompt });
      for await (const chunk of textStream as any) {
        yield chunk;
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error getting response from agent");
    }
  }
}
