import type { APIContext } from "astro";
import type { KnowledgeAssetsAPI } from "../@core-contracts/api";
import type { GenerateNewKnowledgeDTO } from "../@core-contracts/dtos";
import type { ChunkingStrategyType } from "@/modules/chunking/@core-contracts/chunking";

export class AstroRouter {
  constructor(private knowledgeAssetsApi: KnowledgeAssetsAPI) {}

  generateNewKnowledge = async ({ request, params }: APIContext) => {
    const id = params.id;
    console.log({id});
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const fileId = formData.get("id") as string;
        const source = {
          id: fileId,
          name: file.name,
          buffer: Buffer.from(await file.arrayBuffer()),
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        };
        const chunkingStrategy = formData.get("chunkingStrategy") as ChunkingStrategyType;
        const embeddingStrategy = formData.get("embeddingStrategy") as string;
        const command: GenerateNewKnowledgeDTO = {
          source,
          chunkingStrategy,
          embeddingStrategy,
        };
        const knowledgeAsset = await this.knowledgeAssetsApi.generateNewKnowledge(command);
        console.log({knowledgeAsset});
        return new Response(JSON.stringify(knowledgeAsset), { status: 200 });
      } catch (error) {}
    }
    return new Response("NOT IMPLEMENTED", { status: 200 });
  };
}
