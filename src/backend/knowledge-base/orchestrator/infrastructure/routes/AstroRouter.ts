import type { APIContext } from "astro";
import type { KnowledgeAssetsAPI } from "../../@core-contracts/api";
import type { KnowledgeAssetsInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";
import type { ChunkingStrategyType } from "@/modules/knowledge-base/chunking/@core-contracts/entities";
import type { NewKnowledgeDTO } from "@/backend/knowledge-base/knowledge-asset";

export class AstroRouter {
  private knowledgeAssetsApi: Promise<KnowledgeAssetsAPI>;
  constructor(
    knowledgeAssetsApiFactory: (policy: KnowledgeAssetsInfrastructurePolicy) => Promise<KnowledgeAssetsAPI>
  ) {
    this.knowledgeAssetsApi = knowledgeAssetsApiFactory({
      filesPolicy: {
        storage: "node-fs",
        repository: "leveldb",
      },
      textExtractionPolicy: {
        extractor: "pdf",
        repository: "leveldb",
      },
      chunkingPolicy: {
        strategy: "fixed",
      },
      embeddingsPolicy: {
        provider: "node-hf",
        repository: "leveldb",
      },
      knowledgeAssetPolicy: {
        repository: "leveldb",
        aiProvider: "vercel-ai",
      },
    });
  }

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
          url: "",
        };
        const chunkingStrategy = formData.get(
          "chunkingStrategy"
        ) as ChunkingStrategyType;
        const command: NewKnowledgeDTO = {
          name: file.name,
          sources: [source],
          chunkingStrategy,
          id: crypto.randomUUID(),
          metadata: {},
        };
        const knowledgeAsset =
          (await this.knowledgeAssetsApi).generateNewKnowledge(command);
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
        const assetName = formData.get("assetName") as string;
        const source = {
          id: fileId,
          name: file.name,
          buffer: Buffer.from(await file.arrayBuffer()),
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          url: "",
        };
        const chunkingStrategy = formData.get(
          "chunkingStrategy"
        ) as ChunkingStrategyType;
        const command: NewKnowledgeDTO = {
          name: assetName,
          sources: [source],
          chunkingStrategy,
          id: crypto.randomUUID(),
          metadata: {},
        };
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const encoder = new TextEncoder();
              for await (const chunk of (await knowledgeAssetsApi).generateNewKnowledgeStreamingState(
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

  getAllKnowledgeAssets = async ({ params }: APIContext) => {
    const knowledgeAssetsApi = this.knowledgeAssetsApi;
    const knowledgeAssets = await (await knowledgeAssetsApi).getAllKnowledgeAssets();
    return new Response(JSON.stringify(knowledgeAssets), { status: 200 });
  };
  deleteKnowledgeAsset = async ({ params }: APIContext) => {
    const id = params.id;
    console.log({ id });
    const knowledgeAssetsApi = this.knowledgeAssetsApi;
    await (await knowledgeAssetsApi).deleteKnowledgeAsset(id as string);
    return new Response("Knowledge asset deleted successfully", { status: 200 });
  };
}
