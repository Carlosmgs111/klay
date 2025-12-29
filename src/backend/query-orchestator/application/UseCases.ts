import type { AICompletionDTO } from "@/backend/agents/@core-contracts/dtos";
import type { EmbeddingAPI } from "@/backend/embeddings/@core-contracts/api";
import type { AIApi } from "@/backend/agents/@core-contracts/api";

export class UseCases {
  constructor(private embeddingAPI: EmbeddingAPI, private aiApi: AIApi) {}

  async *streamCompletionWithContext(command: AICompletionDTO) {
    const similarQuery = (
      await this.embeddingAPI.search(command.userPrompt)
    ).map((query) => query.document.content);
    console.log({ similarQuery });
    const context = `
    # Response a la siguiente consulta: ${command.userPrompt}
    ${similarQuery.length > 0 ? `\nContexto: ${similarQuery.join("\n")}` : ""}
    `;
    for await (const chunk of this.aiApi.streamCompletion("", {
      ...command,
      userPrompt: context,
    })) {
      yield chunk;
    }
  }
}
