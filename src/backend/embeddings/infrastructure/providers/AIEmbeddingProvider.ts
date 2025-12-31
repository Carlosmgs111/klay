import type { EmbeddingProvider } from "../../@core-contracts/providers";
import { createCohere } from "@ai-sdk/cohere";

const model = createCohere({
  apiKey: import.meta.env.COHERE_API_KEY,
}).textEmbeddingModel("embed-multilingual-v3.0");

export class AIEmbeddingProvider implements EmbeddingProvider {
  private dimensions: number;
  private model = model;

  constructor() {
    this.dimensions = 1024;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.model.doEmbed({ values: [text] });
      return result.embeddings[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.model.doEmbed({ values: texts });
      return response.embeddings;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }
}
