export interface KnowledgeAsset {
    id: string;
    sourceId: string;
    cleanedTextId: string;
    embeddingsIds: string[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
