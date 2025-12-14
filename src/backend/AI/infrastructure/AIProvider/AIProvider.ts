import type { AIProvider } from "../../@core-contracts/providers";
import { streamText } from "ai";
import { createHuggingFace } from "@ai-sdk/huggingface";

export class AISDKProvider implements AIProvider {
  private model: any;
  constructor() {
    this.model = createHuggingFace({
      apiKey: import.meta.env.HF_API_KEY,
    }).languageModel("deepseek-ai/DeepSeek-V3-0324");
  }
  generateCompletion = async (prompt: string) => {
    return prompt;
  };
  async *streamCompletion(prompt: string) {
    try {
      const { fullStream } = await streamText({
        model: this.model,
        prompt: prompt,
      });
      console.log("fullStream ->", fullStream);
      for await (const chunk of fullStream as any) {
        if (chunk.type === "text-delta") {
          // response += chunk.text;
          yield chunk.text;
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error getting response from agent");
    }
  }
}
