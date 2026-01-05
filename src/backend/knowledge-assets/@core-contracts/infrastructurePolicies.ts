import type { FilesInfrastructurePolicy } from "@/modules/files/@core-contracts/infrastructurePolicies";
import type { TextExtractionInfrastructurePolicy } from "@/modules/text-extraction/@core-contracts/infrastructurePolicies";
import type { ChunkingInfrastructurePolicy } from "@/modules/chunking/@core-contracts/infrastructurePolicies";
import type { EmbeddingsInfrastructurePolicy } from "@/modules/embeddings/@core-contracts/infrastructurePolicies";

export type KnowledgeAssetsInfrastructurePolicy = {
  repository: "local-level" | "remote-db" | "browser";
  filesPolicy: FilesInfrastructurePolicy;
  textExtractionPolicy: TextExtractionInfrastructurePolicy;
  chunkingPolicy: ChunkingInfrastructurePolicy;
  embeddingsPolicy: EmbeddingsInfrastructurePolicy;
};
