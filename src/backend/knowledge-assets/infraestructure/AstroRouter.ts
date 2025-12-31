import type { APIContext } from "astro";
import type { KnowledgeAssetsAPI } from "../@core-contracts/api";
import type { GenerateNewKnowledgeDTO } from "../@core-contracts/dtos";
import type { ChunkingStrategyType } from "@/modules/chunking/@core-contracts/entities";

export class AstroRouter {
  constructor(private knowledgeAssetsApi: KnowledgeAssetsAPI) {}

  generateNewKnowledge = async ({ request, params }: APIContext) => {
    const id = params.id;
    console.log({ id });
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
        const chunkingStrategy = formData.get(
          "chunkingStrategy"
        ) as ChunkingStrategyType;
        const embeddingStrategy = formData.get("embeddingStrategy") as string;
        const command: GenerateNewKnowledgeDTO = {
          source,
          chunkingStrategy,
          embeddingStrategy,
        };
        const knowledgeAsset =
          await this.knowledgeAssetsApi.generateNewKnowledge(command);
        console.log({ knowledgeAsset });
        return new Response(JSON.stringify(knowledgeAsset), { status: 200 });
      } catch (error) {}
    }
    return new Response("NOT IMPLEMENTED", { status: 200 });
  };

  generateKnowledgeStreamingState = async ({ request, params }: APIContext) => {
    const id = params.id;
    console.log({ id });
    const contentType = request.headers.get("content-type");
    console.log({ contentType });
    if (contentType?.includes("multipart/form-data")) {
      try {
        const knowledgeAssetsApi = this.knowledgeAssetsApi;
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
        const chunkingStrategy = formData.get(
          "chunkingStrategy"
        ) as ChunkingStrategyType;
        const embeddingStrategy = formData.get("embeddingStrategy") as string;
        const command: GenerateNewKnowledgeDTO = {
          source,
          chunkingStrategy,
          embeddingStrategy,
        };
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const encoder = new TextEncoder();
              for await (const chunk of knowledgeAssetsApi.generateNewKnowledgeStreamingState(
                command
              )) {
                if (chunk instanceof Object) {
                  console.log("CHUNK", chunk);
                  await new Promise((resolve) => setTimeout(resolve));
                  controller.enqueue(encoder.encode(JSON.stringify(chunk)));
                }
              }
              controller.close();
            } catch (error) {
              console.log(error);
              controller.error(error);
            }
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
          },
        });
      } catch (error) {}
    }
    return new Response("NOT IMPLEMENTED", { status: 200 });
  };
}
