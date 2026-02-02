export class Text {
  id: string;
  content: string;
  metadata?: Record<string, any>;

  constructor(id: string, content: string, metadata?: Record<string, any>) {
    this.id = id;
    this.content = content;
    this.metadata = metadata;
  }
}
