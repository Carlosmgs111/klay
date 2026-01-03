import type { FilesInfrastructurePolicy } from "../../../files/@core-contracts/infrastructurePolicies";
import type { TextExtractionInfrastructurePolicy } from "../../../text-extraction/@core-contracts/infrastructurePolicies";
import type { ChunkingInfrastructurePolicy } from "../../../chunking/@core-contracts/infrastructurePolicies";
import type { EmbeddingsInfrastructurePolicy } from "../../../embeddings/@core-contracts/infrastructurePolicies";

export type KnowledgeAssetsInfrastructurePolicy = {
  repository: "local-level" | "remote-db";
  filesPolicy: FilesInfrastructurePolicy;
  textExtractionPolicy: TextExtractionInfrastructurePolicy;
  chunkingPolicy: ChunkingInfrastructurePolicy;
  embeddingsPolicy: EmbeddingsInfrastructurePolicy;
};
