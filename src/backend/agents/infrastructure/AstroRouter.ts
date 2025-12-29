import type { APIContext } from "astro";
import type { AIApi } from "../@core-contracts/api";

export class AstroRouter {
  constructor(private aiApi: AIApi) {}
  streamCompletion = async ({ request }: APIContext) => {
    const { systemPrompt, userPrompt } = await request.json();
    const aiApi = this.aiApi;

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of aiApi.streamCompletion("", {
          systemPrompt,
          userPrompt,
        })) {
          controller.enqueue(chunk);
        }
        controller.close();
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
  };
}
