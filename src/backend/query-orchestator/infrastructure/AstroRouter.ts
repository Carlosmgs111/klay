import type { APIContext } from "astro";
import type { QueryOrchestatorApi } from "../@core-contracts/api";

export class AstroRouter {
  constructor(private api: QueryOrchestatorApi) {}
  streamCompletionWithContext = async (context: APIContext) => {
    const { systemPrompt, userPrompt } = await context.request.json();
    const api = this.api;

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of api.streamCompletionWithContext({
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
