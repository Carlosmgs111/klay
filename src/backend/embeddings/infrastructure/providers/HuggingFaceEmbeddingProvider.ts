import type { EmbeddingProvider } from "../../@core-contracts/providers";
import { InferenceClient } from "@huggingface/inference";

export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  private client: InferenceClient;
  private dimensions: number;
  private model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    this.client = new InferenceClient(options?.apiKey || import.meta.env.HF_API_KEY);
    this.model = options?.model || "BAAI/bge-large-en-v1.5";
    // Common dimensions for different models
    this.dimensions = this.getModelDimensions(this.model);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.featureExtraction({
        model: this.model,
        inputs: text,
        dimensions: this.dimensions,
      });

      // HuggingFace returns different formats depending on the model
      // Ensure we get a flat array of numbers
      const embedding = Array.isArray(response[0]) ? response[0] : response;
      return embedding as number[];
    } catch (error) {
      console.error("HuggingFace embedding error:", error);
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // For batch processing, we can either use multiple single calls or batch API
      // Using multiple calls for better error handling
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );
      return embeddings;
    } catch (error) {
      console.error("HuggingFace batch embeddings error:", error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }

  private getModelDimensions(model: string): number {
    // Common HuggingFace embedding model dimensions
    const modelDimensions: Record<string, number> = {
      "sentence-transformers/all-MiniLM-L6-v2": 384,
      "sentence-transformers/all-mpnet-base-v2": 768,
      "sentence-transformers/all-distilroberta-v1": 768,
      "sentence-transformers/all-MiniLM-L12-v2": 384,
      "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2": 384,
      "sentence-transformers/paraphrase-multilingual-mpnet-base-v2": 768,
      "BAAI/bge-small-en-v1.5": 384,
      "BAAI/bge-base-en-v1.5": 768,
      "BAAI/bge-large-en-v1.5": 1024,
    };

    return modelDimensions[model] || 1024; // Default to 384 if model not found
  }
}