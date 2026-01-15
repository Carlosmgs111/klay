import type { Source, Text } from "./entities";

export interface SourceDTO extends Source {
  buffer: Buffer;
}

export interface TextExtractParams {
  source: SourceDTO;
  id: string;
  collectionId: string;
}

export interface TextExtractDTO {
  content: string;
  metadata?: {
    author?: string;
    title?: string;
    numpages?: number;
  };
}

export interface TextExtractorParams {
  source: SourceDTO;
}

export interface TextExtractionResultDTO extends Partial<Text> {
  status: "success" | "error";
  message?: string;
}

export interface TextIndexDTO extends Omit<Text, "content" | "description"> {}
