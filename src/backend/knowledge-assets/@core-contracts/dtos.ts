import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type { ChunkingStrategyType } from "@/modules/chunking/@core-contracts/chunking";

export interface GenerateNewKnowledgeDTO {
  source: FileUploadDTO | string;
  chunkingStrategy: ChunkingStrategyType;
  embeddingStrategy: string;
}

export interface KnowledgeAssetDTO {
  id: string;
  sourceId: string;
  cleanedTextId: string;
  chunksIds: string[];
  embeddingsIds: string[];
}
