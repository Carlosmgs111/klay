import type { APIContext } from "astro";
import type { KnowledgeAssetApi } from "../../@core-contracts/api";
import type { KnowledgeAssetInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private knowledgeAssetApi: Promise<KnowledgeAssetApi>;
  constructor(
    knowledgeAssetApiFactory: (
      policy: KnowledgeAssetInfrastructurePolicy
    ) => Promise<KnowledgeAssetApi>
  ) {
    this.knowledgeAssetApi = knowledgeAssetApiFactory({
      repository: "idb",
      aiProvider: "vercel-ai",
    });
  }

  generateKnowledgeAsset = async ({ request, params }: APIContext) => {
    const { id } = params;
    const { texts } = await request.json();
    const embeddings = await (
      await this.knowledgeAssetApi
    ).generateKnowledgeAsset(texts);
    return new Response(JSON.stringify(embeddings));
  };

  getAllKnowledgeAssets = async ({ request }: APIContext) => {
    return new Response(
      JSON.stringify(
        await (await this.knowledgeAssetApi).getAllKnowledgeAssets()
      )
    );
  };

  deleteKnowledgeAssetById = async ({ params }: APIContext) => {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "No id provided" }), {
        status: 400,
      });
    }
    const deleted = await (
      await this.knowledgeAssetApi
    ).deleteKnowledgeAsset(id);
    return new Response(JSON.stringify({ deleted }));
  };
}
