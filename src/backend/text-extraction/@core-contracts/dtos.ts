import type { Source } from "./entities";

export interface SourceDTO extends Source {
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
  source: SourceDTO;
}
