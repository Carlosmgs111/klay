import type { FullKnowledgeAssetDTO, NewKnowledgeDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { KnowledgeAssetDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import type { FlowState } from "../@core-contracts/api";
import type { KnowledgeAssetApi } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/api";
import type { KnowledgeAsset } from "../../knowledge-asset";
import { Result } from "@/backend/shared/@core-contracts/result";
import type { NoKnowledgeAssetsCreatedError } from "../../knowledge-asset/domain/errors/NoKnowledgeAssetsCreatedError";
import type { KnowledgeAssetNotFoundError } from "../../knowledge-asset/domain/errors/KnowledgeAssetNotFoundError";
import type { KnowledgeAssetCouldNotBeSavedError } from "../../knowledge-asset/domain/errors/KnowledgeAssetCouldNotBeSavedError";

export class UseCases {
  constructor(private knowledgeAssetApi: KnowledgeAssetApi) {}
  /**
   * This function generates a new knowledge asset from a file.
   * @param command The command to generate a new knowledge asset.
   * @returns A promise that resolves when the knowledge asset is generated.
   */
  async generateNewKnowledge(
    command: NewKnowledgeDTO
  ): Promise<Result<KnowledgeAssetCouldNotBeSavedError, KnowledgeAssetDTO>> {
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
      if (!result.isSuccess) {
        return Result.failure(result.getError());
      }
      return Result.success(result.getValue());
    } catch (error) {
      return Result.failure(error as KnowledgeAssetCouldNotBeSavedError);
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
  getAllKnowledgeAssets(): Promise<Result<NoKnowledgeAssetsCreatedError, KnowledgeAsset[]>> {
    return this.knowledgeAssetApi.getAllKnowledgeAssets();
  }

  async getFullKnowledgeAssetById(id: string): Promise<Result<KnowledgeAssetNotFoundError, FullKnowledgeAssetDTO>> {
    return this.knowledgeAssetApi.getFullKnowledgeAssetById(id);
  }

  async deleteKnowledgeAsset(id: string): Promise<Result<KnowledgeAssetNotFoundError, boolean>> {
    return this.knowledgeAssetApi.deleteKnowledgeAsset(id);
  }
  async retrieveKnowledge(
    knowledgeAssetId: string,
    query: string
  ): Promise<Result<KnowledgeAssetNotFoundError, string[]>> {
    console.log("retrieveKnowledge", knowledgeAssetId, query);
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
