import type { FileUploadDTO } from "@/modules/files/@core-contracts/dtos";
import type { ChunkingStrategyType } from "@/backend/knowledge-base/chunking/@core-contracts/entities";

export interface NewKnowledgeDTO {
  source: FileUploadDTO | string;
  chunkingStrategy: ChunkingStrategyType;
  embeddingStrategy: string;
  cleanedTextId: string;
  embeddingsIds: string[];
}

export interface KnowledgeAssetDTO {
  id: string;
  sourceId: string;
  cleanedTextId: string;
  embeddingsIds: string[];
}
