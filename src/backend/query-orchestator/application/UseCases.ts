import type { AICompletionDTO } from "@/backend/agents/@core-contracts/dtos";
import type { KnowledgeAssetsAPI } from "@/modules/knowledge-base/orchestrator/@core-contracts/api";
import type { AIApi } from "@/backend/agents/@core-contracts/api";

export class UseCases {
  constructor(
    private knowledgeAssetsApi: KnowledgeAssetsAPI,
    private aiApi: AIApi
  ) {}

  async *streamCompletionWithContext(command: AICompletionDTO) {
    console.log("streamCompletionWithContext", command);
    const similarQuery = await this.knowledgeAssetsApi.retrieveKnowledge(
      "21100502-63db-4a3e-8853-ee8bd6b2be0e",
      command.userPrompt
    );
    console.log({ similarQuery });
    // const context = `
    // # Response a la siguiente consulta: ${command.userPrompt}
    // ${similarQuery.length > 0 ? `\nContexto: ${similarQuery.join("\n")}` : ""}
    // `;
    // for await (const chunk of this.aiApi.streamCompletion("", {
    //   ...command,
    //   userPrompt: context,
    // })) {
    //   yield chunk;
    // }
  }
}
