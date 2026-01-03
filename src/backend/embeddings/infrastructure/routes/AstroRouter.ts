import type { APIContext } from "astro";
import type { EmbeddingAPI } from "../../@core-contracts/api";
import type { EmbeddingsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private embeddingAPI: EmbeddingAPI;
  constructor(
    embeddingApiFactory: (policy: EmbeddingsInfrastructurePolicy) => EmbeddingAPI
  ) {
    this.embeddingAPI = embeddingApiFactory({
      provider: "cohere",
      repository: "local-level",
    });
  }

  generateEmbeddings = async ({ request }: APIContext) => {
    const { texts } = await request.json();
    const embeddings = await this.embeddingAPI.generateEmbeddings(texts);
    return new Response(JSON.stringify(embeddings));
  };
  getAllDocuments = async ({ request }: APIContext) => {
    const documents = await this.embeddingAPI.getAllDocuments();
    return new Response(JSON.stringify(documents));
  };
  search = async ({ request }: APIContext) => {
    const { text, topK } = await request.json();
    const results = await this.embeddingAPI.search(text, topK);
    return new Response(JSON.stringify(results));
  };
}
