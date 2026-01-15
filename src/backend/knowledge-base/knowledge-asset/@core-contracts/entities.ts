export interface KnowledgeAsset {
    id: string;
    name: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
