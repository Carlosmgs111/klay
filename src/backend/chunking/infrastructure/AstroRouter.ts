import type { APIContext } from "astro";
import type { ChunkingApi } from "../@core-contracts/api";
import type { ChunkingInfrastructurePolicy } from "../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private chunkingApi: ChunkingApi;
  constructor(
    chunkingApiFactory: (policy: ChunkingInfrastructurePolicy) => ChunkingApi
  ) {
    this.chunkingApi = chunkingApiFactory({
      strategy: "fixed",
    });
  }

  chunkText = async ({ request }: APIContext) => {
    const body = await request.json();
    const { text, config } = body;
    const chunkingApi = this.chunkingApi;
    console.log({ chunkingApi });
    return new Response(
      JSON.stringify(await chunkingApi.chunkOne(text, config))
    );
  }
}
