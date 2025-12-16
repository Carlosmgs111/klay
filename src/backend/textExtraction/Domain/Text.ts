import type { TextDTO } from "../@core-contracts/dtos";

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

  toDTO(): TextDTO {
    return {
      id: this.id,
      sourceId: this.sourceId,
      text: this.text,
      metadata: this.metadata,
    };
  }
}
