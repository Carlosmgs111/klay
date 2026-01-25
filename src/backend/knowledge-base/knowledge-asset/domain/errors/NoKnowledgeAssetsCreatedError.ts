export class NoKnowledgeAssetsCreatedError extends Error {
  constructor() {
    super("No knowledge assets created");
    this.name = "NoKnowledgeAssetsCreatedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
