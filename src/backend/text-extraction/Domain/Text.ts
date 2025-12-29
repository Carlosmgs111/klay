export class Text {
  constructor(
    public id: string,
    public sourceId: string,
    public text: string,
    public metadata?: {
      author?: string;
      title?: string;
      numpages?: number;
    }
  ) {}

  toDTO() {
    return {
      id: this.id,
      sourceId: this.sourceId,
      text: this.text,
      metadata: this.metadata,
    };
  }
}
