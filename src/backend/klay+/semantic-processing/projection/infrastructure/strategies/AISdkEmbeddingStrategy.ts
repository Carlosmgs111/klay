import type {
  EmbeddingStrategy,
  EmbeddingResult,
} from "../../domain/ports/EmbeddingStrategy";

/**
 * Server-side embedding strategy using Vercel AI SDK.
 * Delegates to any provider supported by ai-sdk (OpenAI, Cohere, etc.).
 *
 * Usage:
 *   import { openai } from "@ai-sdk/openai";
 *   const strategy = new AISdkEmbeddingStrategy(openai.embedding("text-embedding-3-small"));
 */
export class AISdkEmbeddingStrategy implements EmbeddingStrategy {
  readonly strategyId: string;
  readonly version = 1;
  model: any | null = null;

  constructor(
    private readonly embeddingModel: any,
    strategyId: string = "ai-sdk-embedding"
  ) {
    this.embeddingModel = embeddingModel;
    this.strategyId = strategyId;
    import("@ai-sdk/cohere").then(({ createCohere }) => {
      this.model = createCohere({
        apiKey: process.env.AISDK_COHERE_API_KEY,
      }).textEmbeddingModel(this.embeddingModel);
    });
  }

 private async resolveModel() {
    if (!this.model) {
      const { createCohere } = await import("@ai-sdk/cohere");
      this.model = createCohere({
        apiKey: "ob7sJLm1mSr4diGSHf4dW8nUxC2BgcUPTZbb62jU",
      }).textEmbeddingModel(this.embeddingModel);
      return this.model;
    }
    return this.model;
  }

  async embed(content: string): Promise<EmbeddingResult> {
    const model = await this.resolveModel();
    const { embedding } = await model.doEmbed({
      values: [content],
    });
    return {
      vector: embedding,
      model: this.strategyId,
      dimensions: embedding.length,
    };
  }

  async embedBatch(contents: string[]): Promise<EmbeddingResult[]> {
    const model = await this.resolveModel();
    const { embeddings } = await model.doEmbed({
      values: contents,
    });
    return embeddings.map((vector: any) => ({
      vector,
      model: this.strategyId,
      dimensions: vector.length,
    }));
  }
}
