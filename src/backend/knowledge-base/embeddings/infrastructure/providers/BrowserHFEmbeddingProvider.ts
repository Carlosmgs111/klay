import type { EmbeddingProvider } from "../../@core-contracts/providers";
import { pipeline, env } from "@xenova/transformers";

// Configure Transformers.js for browser usage
if (typeof window !== "undefined") {
  // Use local models instead of downloading from HuggingFace CDN
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  // Cache models in the browser
  env.useBrowserCache = true;
}

export class BrowserHFEmbeddingProvider implements EmbeddingProvider {
  private extractor: any = null;
  private dimensions: number;
  private model: string;
  private initialized: boolean = false;

  constructor(options?: { model?: string }) {
    // Use a lightweight model that works well in browsers
    this.model = options?.model || "Xenova/all-MiniLM-L6-v2";
    this.dimensions = this.getModelDimensions(this.model);
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      console.log(`Loading embedding model: ${this.model}...`);
      // Create feature extraction pipeline
      this.extractor = await pipeline("feature-extraction", this.model);
      this.initialized = true;
      console.log(`Model ${this.model} loaded successfully!`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      await this.ensureInitialized();

      // Generate embedding
      const output = await this.extractor(text, {
        pooling: "mean",
        normalize: true,
      });

      // Convert tensor to array
      const embedding = Array.from(output.data) as number[];
      console.log("Browser embedding generated:", embedding);
      return embedding;
    } catch (error) {
      console.error("Browser embedding error:", error);
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    console.log("BrowserHFEmbeddingProvider.generateEmbeddings");
    try {
      await this.ensureInitialized();

      // Process all texts in parallel for better performance
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );

      return embeddings;
    } catch (error) {
      console.error("Browser batch embeddings error:", error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }

  private getModelDimensions(model: string): number {
    // Common Transformers.js embedding model dimensions
    const modelDimensions: Record<string, number> = {
      "Xenova/all-MiniLM-L6-v2": 384,
      "Xenova/all-mpnet-base-v2": 768,
      "Xenova/all-distilroberta-v1": 768,
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2": 384,
      "Xenova/bge-small-en-v1.5": 384,
      "Xenova/bge-base-en-v1.5": 768,
      "Xenova/gte-small": 384,
      "Xenova/gte-base": 768,
    };

    return modelDimensions[model] || 384; // Default to 384 if model not found
  }
}
