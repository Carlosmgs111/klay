import type { GenerateNewKnowledgeDTO } from "./dtos";
import type { KnowledgeAssetDTO } from "./dtos";

export interface KnowledgeAssetsAPI {
    generateNewKnowledge(document: GenerateNewKnowledgeDTO): Promise<KnowledgeAssetDTO>;
    retrieveKnowledge(document: string): Promise<void>;
}