import type { APIContext } from "astro";
import type { EmbeddingAPI } from "../../@core-contracts/api";
import type { EmbeddingsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private embeddingAPIPromise: Promise<EmbeddingAPI>;
  constructor(
    embeddingApiFactory: (policy: EmbeddingsInfrastructurePolicy) => Promise<EmbeddingAPI>
  ) {
    this.embeddingAPIPromise = embeddingApiFactory({
      provider: "cohere",
      repository: "local-level",
    });
  }

  generateEmbeddings = async ({ request }: APIContext) => {
    const { texts } = await request.json();
    const embeddingAPI = await this.embeddingAPIPromise;
    const embeddings = await embeddingAPI.generateEmbeddings(texts);
    return new Response(JSON.stringify(embeddings));
  };
  getAllDocuments = async ({ request }: APIContext) => {
    const embeddingAPI = await this.embeddingAPIPromise;
    const documents = await embeddingAPI.getAllDocuments();
    return new Response(JSON.stringify(documents));
  };
  search = async ({ request }: APIContext) => {
    const { text, topK } = await request.json();
    const embeddingAPI = await this.embeddingAPIPromise;
    const results = await embeddingAPI.search(text, topK);
    return new Response(JSON.stringify(results));
  };
}
