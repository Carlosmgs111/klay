export class KnowledgeAsset {
  id: string;
  name: string;
  filesIds: string[];
  textsIds: string[];
  embeddingsCollectionsIds: string[];
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  constructor({
    id,
    name,
    filesIds,
    textsIds,
    embeddingsCollectionsIds,
    metadata,
    version,
  }: {
    id: string;
    name: string;
    filesIds: string[];
    textsIds: string[];
    embeddingsCollectionsIds: string[];
    metadata: any;
    version: string;
  }) {
    this.id = id;
    this.name = name;
    this.filesIds = filesIds;
    this.textsIds = textsIds;
    this.embeddingsCollectionsIds = embeddingsCollectionsIds;
    this.metadata = metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = version;
  }
  private serialize() {
    return {
      id: this.id,
      name: this.name,
      filesIds: this.filesIds,
      textsIds: this.textsIds,
      embeddingsCollectionsIds: this.embeddingsCollectionsIds,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
