export class KnowledgeAssetCouldNotBeSavedError extends Error {
  constructor(public readonly id: string) {
    super(`Knowledge asset could not be saved with id ${id}`);
    this.name = "KnowledgeAssetCouldNotBeSavedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
