import type { APIContext } from "astro";
import { aiUsesCases } from "../index";

export const streamCompletion = async ({ request }: APIContext) => {
  const { systemPrompt, userPrompt } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of aiUsesCases.streamCompletion({
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
