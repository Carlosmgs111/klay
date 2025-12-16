export interface TextDTO {
  text: string;
  id: string;
  sourceId: string;
  metadata?: {
    author?: string;
    title?: string;
    numpages?: number;
  };
}

export interface SourceDTO {
    id: string;
    name?: string;
    type?: string;
    path?: string;
    buffer: Buffer;
}

export interface TextExtractParams {
  source: SourceDTO;
  id: string;
}

export interface TextExtractDTO {
  text: string;
  metadata?: {
    author?: string;
    title?: string;
    numpages?: number;
  };
}

export interface TextExtractorParams {
  buffer: Buffer;
}
