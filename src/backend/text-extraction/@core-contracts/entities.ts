export interface Text {
  text: string;
  id: string;
  sourceId: string;
  metadata?: {
    author?: string;
    title?: string;
    numpages?: number;
  };
}

export interface Source {
  id: string;
  name?: string;
  type?: string;
  path?: string;
}
