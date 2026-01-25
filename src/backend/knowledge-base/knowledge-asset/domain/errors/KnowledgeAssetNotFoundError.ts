export class KnowledgeAssetNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Knowledge asset not found with id ${id}`);
    this.name = "KnowledgeAssetNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
