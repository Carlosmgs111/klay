import type { NewKnowledgeDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { KnowledgeAssetDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { FlowState } from "../@core-contracts/api";
import type { KnowledgeAssetApi } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/api";
import type { KnowledgeAsset } from "../../knowledge-asset";

export class UseCases {
  constructor(private knowledgeAssetApi: KnowledgeAssetApi) {}
  /**
   * This function generates a new knowledge asset from a file.
   * @param command The command to generate a new knowledge asset.
   * @returns A promise that resolves when the knowledge asset is generated.
   */
  async generateNewKnowledge(
    command: NewKnowledgeDTO
  ): Promise<KnowledgeAssetDTO> {
    try {
      const { sources, chunkingStrategy, name } = command;
      const knowledgeAsset: NewKnowledgeDTO = {
        name: name,
        id: crypto.randomUUID(),
        sources: sources,
        chunkingStrategy,
        metadata: {},
      };

      const result = await this.knowledgeAssetApi.generateKnowledgeAsset(
        knowledgeAsset
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async *generateNewKnowledgeStreamingState(
    command: NewKnowledgeDTO
  ): AsyncGenerator<KnowledgeAssetDTO | FlowState> {
    try {
      for await (const event of this.knowledgeAssetApi.generateKnowledgeAssetStreamingState(
        command
      )) {
        console.log({ event });
        yield event;
      }
    } catch (error) {
      console.log(error);
      yield {
        status: "ERROR",
        step: "knowledge-asset",
        message: "Knowledge asset generation failed",
      };
    }
  }
  getAllKnowledgeAssets(): Promise<KnowledgeAsset[]> {
    return this.knowledgeAssetApi.getAllKnowledgeAssets();
  }

  async deleteKnowledgeAsset(id: string): Promise<boolean> {
    await this.knowledgeAssetApi.deleteKnowledgeAsset(id);
    return true;
  }
  async retrieveKnowledge(
    knowledgeAssetId: string,
    query: string
  ): Promise<string[]> {
    try {
      const result = await this.knowledgeAssetApi.retrieveKnowledge(
        knowledgeAssetId,
        query
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}
