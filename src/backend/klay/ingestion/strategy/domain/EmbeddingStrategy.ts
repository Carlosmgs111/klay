export class EmbeddingStrategy {
  id: string;
  model: string;
  store: string;
  version: string;
  constructor(id: string, model: string, store: string, version: string) {
    this.id = id;
    this.model = model;
    this.store = store;
    this.version = version;
  }
}
