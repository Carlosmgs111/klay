import type { FilesInfrastructurePolicy } from "@/modules/files/@core-contracts/infrastructurePolicies";
import type { TextExtractionInfrastructurePolicy } from "@/modules/knowledge-base/text-extraction/@core-contracts/infrastructurePolicies";
import type { ChunkingInfrastructurePolicy } from "@/modules/knowledge-base/chunking/@core-contracts/infrastructurePolicies";
import type { EmbeddingsInfrastructurePolicy } from "@/modules/knowledge-base/embeddings/@core-contracts/infrastructurePolicies";
import type { KnowledgeAssetInfrastructurePolicy } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/infrastructurePolicies";

export type KnowledgeAssetsInfrastructurePolicy = {
  repository: "local-level" | "remote-db" | "browser";
  filesPolicy: FilesInfrastructurePolicy;
  textExtractionPolicy: TextExtractionInfrastructurePolicy;
  chunkingPolicy: ChunkingInfrastructurePolicy;
  embeddingsPolicy: EmbeddingsInfrastructurePolicy;
  knowledgeAssetPolicy: KnowledgeAssetInfrastructurePolicy;
};
