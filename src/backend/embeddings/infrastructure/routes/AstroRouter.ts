import type { APIContext } from "astro";
import type { EmbeddingAPI } from "../../@core-contracts/api";

export class AstroRouter {
  constructor(private embeddingAPI: EmbeddingAPI) {}

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
